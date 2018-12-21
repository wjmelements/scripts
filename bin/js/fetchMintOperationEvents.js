const Web3 = require('web3');

const providerUrl = 'https://mainnet.infura.io/metamask';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const TrueUSDAddress = '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E';
const TrueUSDAbi = require('../abi/trueUsdAbi.json').abi;
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress);

const ControllerAddress = '0x0000000000075EfBeE23fe2de1bd0b7690883cc9';
const ControllerAbi = require('../abi/controllerAbi.json').abi;
const Controller = new web3.eth.Contract(ControllerAbi, ControllerAddress);

const fromBlock = process.argv[2];
const toBlock = process.argv[3];
const format = process.argv[4];

function formatRowSheet({event}) {
    return '=SPLIT("' + event.transactionHash + ',' + event.returnValues._to + ',\'' + event.returnValues.amount + ',' + event.blockNumber + '", ",")'
}

function formatRowEvent({event}) {
    return 'MintOperationEvent(' + event.returnValues._to + ',' + event.returnValues.amount + ',' + event.returnValues.deferBlock + ',' + event.returnValues.opIndex + ')';
}

let formatRow;
if (format == 'sheet') {
    formatRow = formatRowSheet;
} else {
    formatRow = formatRowEvent;
}

Controller.getPastEvents('MintOperationEvent', { fromBlock, toBlock }).then((events) => {
    events.forEach((event) => {
        console.log(formatRow({event}));
    });
}).catch(console.error);
