const { nameToAddress, addressToName, tokenToController } = require('./getTokenAddress.js')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const web3 = require('./web3.js')
const providerUrl = require('./providerUrl.js')
const BN = web3.utils.toBN

let startBlock = process.argv[2]
let endBlock = process.argv[3]
let blockDiff = process.argv[4]
let groupByToken = process.argv[5]

const DEFAULT_BLOCK_DIFF = 5760
if (!blockDiff) {
    blockDiff = DEFAULT_BLOCK_DIFF
}

const UniswapFactoryAddress = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
const tokens = []
for (const tokenAddress in tokenToController) {
    tokens.push({
        tokenAddress,
        tokenName: addressToName[tokenAddress],
    })
}
// additional tokens
tokens.push({
    tokenAddress: '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E',
    tokenName: 'OldTUSD',
})

const EthPurchaseEvent = web3.utils.sha3('EthPurchase(address,uint256,uint256)')
const TokenPurchaseEvent = web3.utils.sha3('TokenPurchase(address,uint256,uint256)')

function getTradeEvents(fromBlock, toBlock, exchangeAddresses) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.open('POST', providerUrl, true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.onreadystatechange = () => {
          if (req.readyState == 4) {
            const results = JSON.parse(req.responseText).result;
            const events = []
            for (let result of results) {
              const event = {
                ...result,
                blockNumber: web3.utils.hexToNumberString(result.blockNumber),
                address: web3.utils.toChecksumAddress(result.address)
              };
              events.push(event)
            }
            resolve(events)
          }
        };
        req.send(JSON.stringify({
          "jsonrpc": "2.0",
          "method": "eth_getLogs",
          "params": [{
            "topics":[
              [
                EthPurchaseEvent,
                TokenPurchaseEvent,
              ],
            ],
            "address": exchangeAddresses,
            "fromBlock": web3.utils.toHex(fromBlock),
            "toBlock": web3.utils.toHex(toBlock)
          }],
          "id": 123
        }));
    });
}
async function fetchExchange(token) {
    const exchangeAddress = await web3.eth.call({
        data: web3.utils.sha3('getExchange(address)').slice(0,10) + '000000000000000000000000' + token.tokenAddress.slice(2).toLowerCase(),
        to: UniswapFactoryAddress
    }).then((result) => web3.utils.toChecksumAddress('0x' + result.slice(26)))
    return exchangeAddress
}

async function main() {
    if (!startBlock) {
        if (endBlock) {
            startBlock = endBlock - blockDiff
        } else {
            endBlock = await web3.eth.getBlockNumber()
            startBlock = endBlock - blockDiff
        }
    } else if (!endBlock) {
        endBlock = 'latest'
    }
    const exchangeAddressFutures = []
    for (let token of tokens) {
        exchangeAddressFutures.push(fetchExchange(token))
    }
    const exchangeAddresses = await Promise.all(exchangeAddressFutures)
    const exchangeAddressToTokenName = {}
    for (let i = 0; i < tokens.length; i++) {
        exchangeAddressToTokenName[exchangeAddresses[i]] = addressToName[tokens[i].tokenAddress]
    }
    const tradeEvents = await getTradeEvents(startBlock, endBlock, exchangeAddresses)
    const totalTradeEth = {}
    const totalTradeToken = {}
    const totalVolEth = {}
    for (let tradeEvent of tradeEvents) {
        const isPurchase = tradeEvent.topics[0] == TokenPurchaseEvent
        const ethAmount = BN(tradeEvent.topics[3 - isPurchase]).div(BN(10 ** 10))
        const tokenAmount = BN(tradeEvent.topics[2 + isPurchase]).div(BN(10 ** 10))
        const price = Number(tokenAmount) / Number(ethAmount)
        const tokenName = exchangeAddressToTokenName[tradeEvent.address]
        if (!totalTradeEth[tokenName]) {
            totalTradeEth[tokenName] = BN(0)
            totalTradeToken[tokenName] = BN(0)
            totalVolEth[tokenName] = BN(0)
        }
        if (isPurchase) {
            totalTradeEth[tokenName] = totalTradeEth[tokenName].add(ethAmount)
            totalTradeToken[tokenName] = totalTradeToken[tokenName].sub(tokenAmount)
        } else {
            totalTradeEth[tokenName] = totalTradeEth[tokenName].sub(ethAmount)
            totalTradeToken[tokenName] = totalTradeToken[tokenName].add(tokenAmount)
        }
        totalVolEth[tokenName] = totalVolEth[tokenName].add(ethAmount)
        console.log(
            exchangeAddressToTokenName[tradeEvent.address],
            isPurchase ? 'Sell' : 'Buy', // from the perspective of the Uniswap
            price,
            '|',
            Number(tokenAmount) / 1e8,
            tokenName,
            '/',
            Number(ethAmount) / 1e8,
            'ETH |',
            tradeEvent.transactionHash
        )
    }
    if (groupByToken) {
        console.log('-------')
        const sortedTokens = []
        for (let token in totalTradeEth) {
            sortedTokens.push(token)
        }
        sortedTokens.sort((a,b) => totalVolEth[b] - totalVolEth[a])
        for (let token of sortedTokens) {
            const totalEth = Number(totalTradeEth[token]) / 1e8
            const totalToken = Number(totalTradeToken[token]) / 1e8
            const price = Math.abs(Number(totalTradeToken[token]) / Number(totalTradeEth[token]))
            const volumeEth = Number(totalVolEth[token]) / 1e8
            console.log(token, price, totalToken, totalEth, volumeEth)
        }
    }
}
main()
