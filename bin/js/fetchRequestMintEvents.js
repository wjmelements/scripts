const web3 = require('./web3.js');
const providerUrl = require('./providerUrl.js');
const { getControllerAddress } = require('./getTokenAddress.js');


const fromBlock = process.argv[2];
const toBlock = process.argv[3];
const format = process.argv[4];
const controllerAddress = getControllerAddress(process.argv[5] || 'TUSD');
const ControllerAbi = require('../abi/controllerAbi.json');
const Controller = new web3.eth.Contract(ControllerAbi, controllerAddress);

const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

function formatRowSheet({event}) {
    return '=SPLIT("' + event.returnValues.opIndex + ',' + event.transactionHash + ',' + event.returnValues.to + ',\'' + event.returnValues.value + ',' + event.blockNumber + '", ",")'
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
req.setRequestHeader('Content-Type', 'application/json');
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
    "address": controllerAddress,
    "fromBlock": web3.utils.toHex(fromBlock),
    "toBlock": web3.utils.toHex(toBlock)
  }],
  "id": 123
}));
