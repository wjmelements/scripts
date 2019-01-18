const Web3 = require("Web3");
const providerUrl = 'https://mainnet.infura.io';
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

const RegistryAddress = '0x0000000000013949F288172bD7E36837bDdC7211'
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

const counts = {}

function getRegistryEvents( { startBlock, endBlock } ) {
  return new Promise(async function(resolve, reject) {
    const req = new XMLHttpRequest();
    req.onreadystatechange = () => {
      if (req.readyState != 4) {
        return;
      }
      if (!req.responseText) {
        reject({ startBlock, endBlock});
        return
      }
      const response = JSON.parse(req.responseText);
      if (response.result) {
        resolve(response.result);
      } else {
        reject({ startBlock, endBlock, error: response.error });
      }
    };
    req.open('POST', providerUrl, true);
    req.send(JSON.stringify({
      "jsonrpc": "2.0",
      "method": "eth_getLogs",
      "params": [{
        "topics":[
          /* SetAttribute */ '0x7f467fc85b3c9db1144a5f705bcb37dcd17e760ed57b1921186f50b51000c3a1',
        ],
        "address": RegistryAddress,
        "fromBlock": web3.utils.toHex(startBlock),
        "toBlock": web3.utils.toHex(endBlock)
      }],
      "id": startBlock
    }));
  });
}

web3.eth.getBlockNumber().then((endBlockNumber)=> {
  getRegistryEvents({
    startBlock:	web3.utils.toHex(7073339),
    endBlock: web3.utils.toHex(7073965/*endBlockNumber*/),
  }).then((events) => {
    for (let event of events) {
      const fmt = {
        attribute: event.data.slice(2,66),
        address: event.topics[1].slice(26),
        transactionHash: event.transactionHash
      };
      if (!counts[fmt.address + fmt.attribute]) {
        counts[fmt.address + fmt.attribute] = 0;
      }
      counts[fmt.address + fmt.attribute]++;
    }
    let countsArr = []
    for (let key in counts) {
      countsArr.push([key, counts[key]]);
    }
    countsArr.sort(function(a, b) {
      return a[1] - b[1];
    })
    console.log(countsArr);
  });
});
