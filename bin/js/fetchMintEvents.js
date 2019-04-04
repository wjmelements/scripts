const math = require('mathjs');
const web3 = require('./web3.js');
const { getControllerAddress, getTokenAddress } = require('./getTokenAddress.js');
const abiDecoder = require('abi-decoder');


const fromBlock = process.argv[2];
const toBlock = process.argv[3];
const format = process.argv[4];
const controllerAddress = getControllerAddress(process.argv[5] || 'TUSD');
const ControllerAbi = require('../abi/controllerAbi.json');
const Controller = new web3.eth.Contract(ControllerAbi, controllerAddress);
const TokenAddress = getTokenAddress(process.argv[5] || 'TUSD');
const TokenAbi = require('../abi/trueUsdAbi.json');
const Token = new web3.eth.Contract(TokenAbi, TokenAddress);

abiDecoder.addABI(ControllerAbi);

function formatRowSheet({ event, transaction }) {
    const decodedTransaction = abiDecoder.decodeMethod(transaction.input);
    const mintIndex = decodedTransaction.params[0].value;
    const value = math.divide(event.returnValues.value, 10 ** 18).toFixed(2);
    return '=SPLIT("' + event.transactionHash + ',' + event.returnValues.to + ',' + value + ',' + event.blockNumber + ',' + mintIndex + '", ",")';
}

function formatRowEvent({ event, transaction }) {
    return 'Mint(' + event.returnValues.to + ',' + event.returnValues.value + ')';
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

Token.getPastEvents('Mint', { fromBlock, toBlock }).then((events) => {
    let promises = [];
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
