const web3 = require('./web3.js')
const { addressToName, tokenToController } = require('./getTokenAddress.js')
const ControllerAbi = require('../abi/controllerAbi.json');

// name -> web3.eth.Contract
const allTokenControllers = {}
for (let controllerAddress of Object.values(tokenToController)) {
    allTokenControllers[addressToName[controllerAddress]] = new web3.eth.Contract(ControllerAbi, controllerAddress)
}

module.exports = allTokenControllers
