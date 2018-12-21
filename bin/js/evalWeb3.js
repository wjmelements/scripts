const Web3 = require('web3');

const providerUrl = 'https://mainnet.infura.io';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const TrueUSDAddress = '0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E';
const TrueUSDAbi = require('../abi/trueUsdAbi.json').abi
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

const ControllerAddress = '0x0000000000075EfBeE23fe2de1bd0b7690883cc9';
const ControllerAbi = require('../abi/controllerAbi.json').abi
const Controller = new web3.eth.Contract(ControllerAbi, ControllerAddress);

let result = eval(process.argv[2])
if (result && result.then) {
    result.then(console.log).catch(console.error);
} else {
    console.log(result);
}
