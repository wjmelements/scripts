const Web3 = require('web3');
const math = require('mathjs');

const providerUrl = 'https://mainnet.infura.io/';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
const abiDecoder = require('abi-decoder');

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json');
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress);

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

TrueUSD.getPastEvents('Mint', { fromBlock, toBlock }).then((events) => {
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
