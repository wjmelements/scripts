const { nameToAddress, addressToName, tokenToController } = require('./getTokenAddress.js')
const web3 = require('./web3.js')


const UniswapFactoryAddress = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
tokens = []
for (const tokenAddress in tokenToController) {
    tokens.push({
        tokenAddress,
        tokenName: addressToName[tokenAddress],
    })
}
// additional tokens
tokens.push({
    tokenAddress: '0x27054b13b1B798B345b591a4d22e6562d47eA75a',
    tokenName: 'AST',
    decimals: 4,
})
tokens.push({
    tokenAddress: '0x4f3AfEC4E5a3F2A6a1A411DEF7D7dFe50eE057bF',
    tokenName: 'DGX',
    decimals: 9,
})
tokens.push({
    tokenAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    tokenName: 'WBTC',
    decimals: 8,
})
tokens.push({
    tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenName: 'WETH',
})
tokens.push({
    tokenAddress: '0xB62132e35a6c13ee1EE0f84dC5d40bad8d815206',
    tokenName: 'NEX',
})
tokens.push({
    tokenAddress: '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E',
    tokenName: 'OldTUSD',
})
tokens.push({
    tokenAddress: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
    tokenName: 'DAI',
})
tokens.push({
    tokenName: 'MCD',
    tokenAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F'
})
tokens.push({
    tokenAddress: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
    tokenName: 'PAX',
})
tokens.push({
    tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    tokenName: 'USDC',
    decimals: 6,
})
tokens.push({
    tokenAddress: '0x57Ab1E02fEE23774580C119740129eAC7081e9D3',
    tokenName: 'sUSD',
    decimals: 18,
})
tokens.push({
    tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
    tokenName: 'MKR',
})
tokens.push({
    tokenAddress: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    tokenName: 'ZRX',
})
tokens.push({
    tokenAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    tokenName: 'LINK',
})
tokens.push({
    tokenAddress: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
    decimals: 8,
    tokenName: 'cDAI'
})
tokens.push({
    tokenAddress: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
    decimals: 8,
    tokenName: 'cETH'
})
tokens.push({
    tokenAddress: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
    decimals: 8,
    tokenName: 'cUSDC'
})
/* No USDT Uniswap
tokens.push({
    tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    tokenName: 'USDT',
})
*/

async function fetchExchangeAndRate(token) {
    const exchangeAddress = await web3.eth.call({
        data: web3.utils.sha3('getExchange(address)').slice(0,10) + '000000000000000000000000' + token.tokenAddress.slice(2).toLowerCase(),
        to: UniswapFactoryAddress
    }).then((result) => web3.utils.toChecksumAddress('0x' + result.slice(26)))
    const futures = []
    const data = web3.utils.sha3('balanceOf(address)').slice(0,10) + '000000000000000000000000' + exchangeAddress.slice(2).toLowerCase()
    futures.push(web3.eth.call({
        // get balance of Uniswap in Token
        data: data,
        to: token.tokenAddress
    }).then(Number))
    futures.push(web3.eth.getBalance(exchangeAddress))
    const decimals = token.decimals || 18
    const [ tokenBalance, ethBalance ] = await Promise.all(futures)
    token.exchangeAddress = exchangeAddress
    token.tokenBalance = tokenBalance / (10 ** decimals)
    token.ethBalance = ethBalance
    let priceCents = String(Math.round(10 ** (18 - decimals) * 10000 * tokenBalance / ethBalance))
    while (priceCents.length <= 4) {
        priceCents = '0' + priceCents;
    }
    token.price = priceCents.slice(0, -4) + '.' + priceCents.slice(-4)
}
async function run() {
    let futures = []
    for (let token of tokens) {
        futures.push(fetchExchangeAndRate(token))
    }
    await Promise.all(futures)
    tokens.sort((t1, t2) => t2.ethBalance - t1.ethBalance)
    for (let token of tokens) {
        console.log(String(token.price), token.tokenName, token.tokenBalance, '/', token.ethBalance / 1e18, 'ETH', token.exchangeAddress)
    }
}
run()
