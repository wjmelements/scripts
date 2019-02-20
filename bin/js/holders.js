const web3 = require('./web3.js');

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

const OldTrueUSDAddress = '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E';
const OldTrueUSD = new web3.eth.Contract(TrueUSDAbi, OldTrueUSDAddress)

const FirstTransferBlockNumber = 5198636; // 0x77f1144dd16c3f2eaa8298b74f933d0aa0008552a0d6a376cbfd4ecd48ad38aa
const DelegateBlockNumber = 7006712; // 0x81c880de8f67362cb4792990560a6adf9aab819bbe28e334867ce8e4f88415a6

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const math = require('mathjs');

function getTransfers({ startBlockNumber, endBlockNumber }) {
  return new Promise(async function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState == 4) {
        if (!req.responseText) {
          reject({ startBlockNumber, endBlockNumber });
          return
        }
        const response = JSON.parse(req.responseText);
        if (response.result) {
          resolve(response.result);
        } else {
          reject({ startBlockNumber, endBlockNumber, error: response.error });
        }
      }
    };
    req.open('POST', providerUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_getLogs",
      "params": [{
        "topics":[
          /* ERC20 Transfer */ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        ],
        "address": OldTrueUSDAddress,
        "fromBlock": web3.utils.toHex(startBlockNumber),
        "toBlock": web3.utils.toHex(endBlockNumber)
      }],
      "id": startBlockNumber
    }));
  });
}

let balances = {};

function printBalances() {
  let accounts = {}
  for (let account in balances) {
    if (balances[account] == 0) {
      continue;
    }
    accounts[account] = math.format(balances[account], {notation:'fixed'});
  }
  console.log(accounts);
}
async function run() {
  let promises = [];
  for (let blockNumber = FirstTransferBlockNumber; blockNumber <= DelegateBlockNumber; blockNumber+=1000) {
    promises.push(getTransfers({
      startBlockNumber: blockNumber,
      endBlockNumber: blockNumber + 999
    }).then((transfers) => {
      for (let rawTransfer of transfers) {
        let transfer = {
          amount: math.bignumber(rawTransfer.data),
          from: rawTransfer.topics[1],
          to: rawTransfer.topics[2]
        };
        if (!balances[transfer.from]) {
          balances[transfer.from] = math.bignumber(0);
        }
        if (!balances[transfer.to]) {
          balances[transfer.to] = math.bignumber(0);
        }
        balances[transfer.from] = math.subtract(balances[transfer.from], transfer.amount);
        balances[transfer.to] = math.add(balances[transfer.to], transfer.amount);
      }
    }).catch((error) => {
      console.error(error);
    }));
    if (promises.length > 200) {
      await Promise.all(promises);
      promises = [];
    }
  }
  Promise.all(promises).then(printBalances);
}
run();
