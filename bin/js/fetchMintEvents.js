const Web3 = require('web3');

const providerUrl = 'https://mainnet.infura.io/metamask';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
const abiDecoder = require('abi-decoder');

const TrueUSDAddress = '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E';
const TrueUSDAbi = require('../abi/trueUsdAbi.json').abi;
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress);

const ControllerAddress = '0x000000c96e715A5B8cD3Beaea66bdb749225fA2F';
const ControllerAbi = require('../abi/controllerAbi.json').abi;
const Controller = new web3.eth.Contract(ControllerAbi, ControllerAddress);

const fromBlock = process.argv[2];
const toBlock = process.argv[3];
const format = process.argv[4];

abiDecoder.addABI(ControllerAbi);

function formatRowSheet({ event, transaction }) {
    const decodedTransaction = abiDecoder.decodeMethod(transaction.input);
    const mintIndex = decodedTransaction.params[0].value;
    return '=SPLIT("' + event.transactionHash + ',' + event.returnValues.to + ',\'' + event.returnValues.amount + ',' + event.blockNumber + ',' + mintIndex + '", ",")';
}

function formatRowEvent({ event, transaction }) {
    return 'Mint(' + event.returnValues.to + ',' + event.returnValues.amount + ')';
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
