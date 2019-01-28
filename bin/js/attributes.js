web3 = require('./web3.js');

const RegistryAddress = '0x0000000000013949F288172bD7E36837bDdC7211';
const RegistryAbi = require('../abi/registryAbi.json');
const Registry = new web3.eth.Contract(RegistryAbi, RegistryAddress);

const attributes = [
  {
    bytes32: '0x69734465706f7369744164647265737300000000000000000000000000000000',
    name: 'DEPOSIT_ADDRESS',
    addressModifier: (address) => '0x00000' + address.toLowerCase().slice(2, -5),
  },
  {
    bytes32: '0x6973426c61636b6c697374656400000000000000000000000000000000000000',
    name: 'BLACKLISTED',
  },
  {
    bytes32: '0x6973545553444d696e7450617573657273000000000000000000000000000000',
    name: 'MINT_PAUSER',
  },
  {
    bytes32: '0x6973545553444d696e7452617469666965720000000000000000000000000000',
    name: 'MINT_RATIFIER',
  },
  {
    bytes32: '0x697354555344526564656d7074696f6e41646d696e0000000000000000000000',
    name: 'REDEMPTION_ADMIN',
  },
  {
    bytes32: '0x697352656769737465726564436f6e7472616374000000000000000000000000',
    name: 'REGISTERED_CONTRACT',
  },
  {
    bytes32: '0x63616e4275726e00000000000000000000000000000000000000000000000000',
    name: 'CAN_BURN',
  },
  {
    bytes32: '0x6861735061737365644b59432f414d4c00000000000000000000000000000000',
    name: 'PASSED_KYCAML',
  },
  {
    bytes32: '0x63616e536574467574757265526566756e644d696e4761735072696365000000',
    name: 'SET_FUTURE_REFUND_MIN_GAS_PRICE',
  },
];

function hasAttribute(address, attribute) {
  return Registry.methods.hasAttribute(attribute.addressModifier ? attribute.addressModifier(address) : address, attribute.bytes32).call().then((hasAttribute) => hasAttribute ? attribute.name : false);
}

function hasWriteAttribute(address, attribute) {
  return Registry.methods.writeAttributeFor(attribute.bytes32).call().then((writeAttributeBytes32) => hasAttribute(address, {
    name: 'WRITE_' + attribute.name,
    bytes32: writeAttributeBytes32,
  }))
}

function hasWriteWriteAttribute(address, attribute) {
  return Registry.methods.writeAttributeFor(attribute.bytes32).call().then((writeAttributeBytes32) => hasWriteAttribute(address, {
    name: 'WRITE_' + attribute.name,
    bytes32: writeAttributeBytes32,
  }))
}

async function fetchAllAttributes(address) {
  let requests = [];
  for (let attribute of attributes) {
    requests.push(hasAttribute(address, attribute));
  }
  // WRITE_
  for (let attribute of attributes) {
    requests.push(hasWriteAttribute(address, attribute));
  }
  // WRITE_WRITE_
  for (let attribute of attributes) {
    requests.push(hasWriteWriteAttribute(address, attribute));
  }
  return await Promise.all(requests).then((results) => results.filter((result) => result));
}

function printAddressAttributes() {
  for (let i = 2; i < process.argv.length; i++) {
    let address = process.argv[i];
    fetchAllAttributes(address).then((attributes) => {
      console.log(address, attributes);
    });
  }
}

printAddressAttributes();
