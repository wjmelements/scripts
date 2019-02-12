web3 = require('./web3.js');

const RegistryAddress = '0x0000000000013949F288172bD7E36837bDdC7211';
const RegistryAbi = require('../abi/registryAbi.json');
const Registry = new web3.eth.Contract(RegistryAbi, RegistryAddress);

const attributes = require('./registryAttributes.js');
const writeAttributeFor = require('./writeAttributeFor.js');

function hasAttribute(address, attribute) {
  return Registry.methods.hasAttribute(attribute.addressModifier ? attribute.addressModifier(address) : address, attribute.bytes32).call().then((hasAttribute) => hasAttribute ? attribute.name : false);
}

function hasWriteAttribute(address, attribute) {
  return hasAttribute(address, writeAttributeFor(attribute));
}

function hasWriteWriteAttribute(address, attribute) {
  return hasAttribute(address, writeAttributeFor(writeAttributeFor(attribute)));
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
      console.log(web3.utils.toChecksumAddress(address), attributes);
    });
  }
}

printAddressAttributes();
