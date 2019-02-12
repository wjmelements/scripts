const web3 = require('./web3.js');
const providerUrl = require('./providerUrl.js');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const RegistryAddress = '0x0000000000013949F288172bD7E36837bDdC7211';
const RegistryAbi = require('../abi/registryAbi.json');
const Registry = new web3.eth.Contract(RegistryAbi, RegistryAddress);

const RegistryStartBlock = 6906932;

const allAttributes = require('./registryAttributes.js');
const writeAttributeFor = require('./writeAttributeFor.js');

// bytes32 -> attribute
const attributes = {};
for (let attribute of allAttributes) {
  attributes[attribute.bytes32] = { attribute };
  const writeAttribute = writeAttributeFor(attribute);
  attributes[writeAttribute.bytes32] = { attribute: writeAttribute };
  const writeWriteAttribute = writeAttributeFor(writeAttribute);
  attributes[writeWriteAttribute.bytes32] = { attribute: writeWriteAttribute };
}

function applyEvents(eventsArr) {
  for (let events of eventsArr) {
    // assumption: events supplied in order
    for (let event of events) {
      if (!(event.attribute in attributes)) {
        process.stderr.write('Unknown attribute ' + event.attribute + '\n');
        continue;
      }
      attributes[event.attribute][event.who] = event;
    }
  }
}

function printRegistry() {
  for (let atIdx in attributes) {
    const attribute = attributes[atIdx];
    for (let who in attribute) {
      if (who == 'attribute') {
        continue;
      }
      if (!attribute[who].value) {
        continue;
      }
      process.stdout.write(attribute.attribute.name);
      for (let i = attribute.attribute.name.length; i < 38; i++) {
        process.stdout.write(' ');
      }
      process.stdout.write(who);
      process.stdout.write(' ');
      process.stdout.write(attribute[who].value);
      process.stdout.write(' ');
      process.stdout.write(attribute[who].transactionHash);
      process.stdout.write('\n');
    }
  }
}

function getEvents({ fromBlock, toBlock }) {
  return new Promise(function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState !== 4) {
        return;
      }
      const results = JSON.parse(req.responseText).result;
      resolve(results.map((result) => ({
        blockNumber: web3.utils.toDecimal(result.blockNumber),
        transactionHash: result.transactionHash,
        who: web3.utils.toChecksumAddress('0x' + result.topics[1].slice(26)),
        attribute: result.data.slice(0, 66),
        value: result.data.slice(66, 130)
      })));
    };
    req.open('POST', providerUrl, true);
    req.send(JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_getLogs",
      "params": [{
        "topics":[
          /* SetAttribute */ '0x7f467fc85b3c9db1144a5f705bcb37dcd17e760ed57b1921186f50b51000c3a1'
        ],
        "address": RegistryAddress,
        "fromBlock": web3.utils.toHex(fromBlock),
        "toBlock": web3.utils.toHex(toBlock)
      }],
      "id": fromBlock
    }));
  });
}

const BATCH_SIZE = 100000;

async function run() {
  const endBlock = await web3.eth.getBlockNumber();
  let promises = [];
  for (let fromBlock = RegistryStartBlock; fromBlock <= endBlock; fromBlock += BATCH_SIZE) {
    promises.push(getEvents({
      fromBlock,
      toBlock: Math.min(fromBlock + BATCH_SIZE - 1, endBlock)
    }).then((events) => events.sort((one, two) => one.blockNumber - two.blockNumber)));
  }
  await Promise.all(promises).then(applyEvents).then(printRegistry);
}

run();
