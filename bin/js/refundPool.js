const Web3 = require('web3');

const providerUrl = 'https://mainnet.infura.io';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

TrueUSD.methods.remainingGasRefundPool().call().then((pool) => {
  console.log(pool / 3);
})
