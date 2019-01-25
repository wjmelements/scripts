// This is a common file for all js files using web3
// Include it with:
// web3 = require('./web3.js');

const Web3 = require('web3');
const providerUrl = 'https://mainnet.infura.io';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

module.exports = web3
