const math = require('mathjs');
const web3 = require('./web3.js');
const providerUrl = require('./providerUrl.js');
const abiDecoder = require('abi-decoder');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const ControllerAddress = '0x0000000000075EfBeE23fe2de1bd0b7690883cc9';
const ControllerAbi = require('../abi/controllerAbi.json');
const Controller = new web3.eth.Contract(ControllerAbi, ControllerAddress);

const fromBlock = process.argv[2];
const toBlock = process.argv[3];
const format = process.argv[4];

abiDecoder.addABI(ControllerAbi);

function formatRowSheet({ event, transaction }) {
    const decodedTransaction = abiDecoder.decodeMethod(transaction.input);
    const mintIndex = decodedTransaction.params[0].value;
    const value = math.divide(event.returnValues.value, 10 ** 18).toFixed(2);
    return '=SPLIT("' + event.transactionHash + ',' + event.returnValues.to + ',' + value + ',' + event.blockNumber + ',' + '' + '", ",")';
}

function formatRowEvent({ event, transaction }) {
    return 'InstantMint(' + event.returnValues.to + ',' + event.returnValues.value + ','+event.returnValues.mintKey + ')';
}

let formatRow;
if (format == 'sheet') {
    formatRow = formatRowSheet;
} else {
    formatRow = formatRowEvent;
}

async function processEvent(event) {
    const transaction = await web3.eth.getTransaction(event.transactionHash)
    return { event, transaction };
}

/* uncomment when web3 works :(
Controller.getPastEvents('InstantMint', { fromBlock, toBlock }).then((events) => {
    let promises = [];
    console.log('ayy')
    events.forEach((event) => {
        promises.push(new Promise(async function(resolve, reject) {
            const row = await processEvent(event);
            resolve(row);
        }));
    });
    Promise.all(promises).then((rows) => {
        rows.sort((a,b)=>{return a.event.blockNumber - b.event.blockNumber;});
        rows.forEach((row) => {
            console.log(formatRow(row));
        });
    });
}).catch(console.error);
*/
let req = new XMLHttpRequest();
req.open('POST', providerUrl, true);
req.setRequestHeader('Content-Type', 'application/json');
req.onreadystatechange = () => {
  if (req.readyState == 4) {
    const results = JSON.parse(req.responseText).result;
    for (let result of results) {
      const event = {
        ...result,
        blockNumber: web3.utils.hexToNumberString(result.blockNumber),
        returnValues: {
          to: '0x' + result.topics[1].slice(26),
          value: web3.utils.hexToNumberString(result.topics[2]),
          mintKey: '0x' + result.topics[3].slice(26),
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
      /* RequestMint */ '0xec755a4feb8086d62e216ca919461349221df54bf9ca83300b7a2bf8e5807dfc',
    ],
    "address": '0x0000000000075EfBeE23fe2de1bd0b7690883cc9',
    "fromBlock": web3.utils.toHex(fromBlock),
    "toBlock": web3.utils.toHex(toBlock)
  }],
  "id": 123
}));
