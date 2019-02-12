const web3 = require('./web3.js')


const canWriteTo = Buffer.from(web3.utils.sha3("canWriteTo-").slice(2), 'hex');

function writeAttributeFor(attribute) {
  let bytes = Buffer.from(attribute.bytes32.slice(2), 'hex');
  for (let index = 0; index < canWriteTo.length; index++) {
    bytes[index] ^= canWriteTo[index];
  }
  const bytes32 = web3.utils.sha3('0x' + bytes.toString('hex'));
  
  return {
    name: 'WRITE_' + attribute.name,
    bytes32
  };
}


module.exports = writeAttributeFor;
