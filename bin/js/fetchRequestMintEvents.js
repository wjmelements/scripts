const Web3 = require('web3');

const providerUrl = 'https://mainnet.infura.io/';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json').abi;
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress);

const ControllerAddress = '0x0000000000075EfBeE23fe2de1bd0b7690883cc9';
const ControllerAbi = require('../abi/controllerAbi.json');
const Controller = new web3.eth.Contract(ControllerAbi, ControllerAddress);

const fromBlock = process.argv[2];
const toBlock = process.argv[3];
const format = process.argv[4];

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function formatRowSheet({event}) {
    return '=SPLIT("' + event.transactionHash + ',' + event.returnValues.to + ',\'' + event.returnValues.value + ',' + event.blockNumber + '", ",")'
}

function formatRowEvent({event}) {
    return 'RequestMint(' + event.returnValues.to + ',' + event.returnValues.value + ',' + event.returnValues.opIndex + ',' + event.returnValues.mintKey + ')';
}

let formatRow;
if (format == 'sheet') {
    formatRow = formatRowSheet;
} else {
    formatRow = formatRowEvent;
}

/* uncomment when web3 works :(
Controller.getPastEvents('RequestMint', { fromBlock, toBlock }).then((events) => {
    events.forEach((event) => {
        console.log(formatRow({event}));
    });
}).catch(console.error);
*/

let req = new XMLHttpRequest();
req.open('POST', providerUrl, true);
req.onreadystatechange = () => {
  if (req.readyState == 4) {
    const results = JSON.parse(req.responseText).result;
    for (let result of results) {
      const event = {
        ...result,
        blockNumber: web3.utils.hexToNumberString(result.blockNumber),
        returnValues: {
          opIndex: web3.utils.hexToNumberString(result.data.slice(0, 66)),
          to: '0x' + result.topics[1].slice(26),
          value: web3.utils.hexToNumberString(result.topics[2]),
          mintKey: '0x' + result.data.slice(90),
        },
      };
      console.log(formatRow({event}));
    }
  }
};
req.send(JSON.stringify({
  "jsonrpc": "2.0",
  "method": "eth_getLogs",
  "params": [{
    "topics":[
      /* RequestMint */ '0x883eab2a74c029007e37f3f118fa7713d39b756c0b7c932a0269fcb995a4724c',
    ],
    "address": '0x0000000000075EfBeE23fe2de1bd0b7690883cc9',
    "fromBlock": web3.utils.toHex(fromBlock),
    "toBlock": web3.utils.toHex(toBlock)
  }],
  "id": 123
}));
