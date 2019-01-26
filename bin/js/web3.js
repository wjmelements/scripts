// This is a common file for all js files using web3
// Include it with:
// web3 = require('./web3.js');

const fs = require('fs');
const Web3 = require('web3');

const defaultProviderUrl = 'https://mainnet.infura.io';

let customProviderUrl;
try {
  customProviderUrl = fs.readFileSync('./config/ethrpc', 'utf8');
} catch (e) {}

const providerUrl = customProviderUrl || defaultProviderUrl;

const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

module.exports = web3
