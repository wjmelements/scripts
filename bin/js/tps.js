const web3 = require('./web3.js')
const providerUrl = require('./providerUrl.js')
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const { addressToName } = require('./getTokenAddress')


function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function fetchTransfers(fromBlock, toBlock) {
    return new Promise((resolve, reject) => {
        xhr = new XMLHttpRequest()
        xhr.onreadystatechange = () => {
            if (xhr.readyState == 4) {
                if (!xhr.responseText) {
                    reject({ fromBlock, toBlock });
                    return
                }
                const response = JSON.parse(xhr.responseText)
                if (response.result) {
                    resolve(response.result)
                } else {
                    reject({ fromBlock, toBlock, error: response.error})
                }
            }
        };
        xhr.open('POST', providerUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
          "jsonrpc": "2.0",
          "method": "eth_getLogs",
          "params": [{
            "topics":[
              /* ERC20 Transfer */ '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            ],
            "fromBlock": web3.utils.toHex(fromBlock),
            "toBlock": web3.utils.toHex(toBlock)
          }],
          "id": fromBlock
        }));
    })
}

results = {}
function countKnown(txs) {
    function addResult(name) {

        if (name in results) {
            results[name] += 1
        } else {
            results[name] = 1
        }
    }
    for (let tx of txs) {
        tx.address = web3.utils.toChecksumAddress(tx.address)
        if (tx.address in addressToName) {
            addResult(addressToName[tx.address])
        } else {
            addResult(tx.address)
        }
    }
    return results
}

const stepSize = 40
const windowSize = 40320 // 50 // 5760

web3.eth.getBlockNumber().then(async (blockNumber) => {
    function retry({ fromBlock, toBlock, error }) {
        if (error) {
            console.error(fromBlock, toBlock, error)
        }
        return fetchTransfers(fromBlock, toBlock).catch(retry)
    }
    for (let end = blockNumber; end > blockNumber - windowSize; end -= stepSize) {
        function prettyPrint(counts) {
            currentWindowSize = blockNumber - this + stepSize
            console.log('In the last \x1b[4m' + currentWindowSize + '\x1b[0m blocks')
            items = Object.keys(results)
            items.sort((a,b)=>(results[b]-results[a]))
            for (let key of items) {
                if (key.length == 42 && results[key] > 25) {
                    new web3.eth.Contract([{
                      "constant": true,
                      "inputs": [],
                      "name": "name",
                      "outputs": [
                        {
                          "name": "",
                          "type": "string"
                        }
                      ],
                      "payable": false,
                      "stateMutability": "pure",
                      "type": "function"
                    }], key).methods.name().call().then((realName) => {
                        addressToName[key] = realName
                        results[realName] = results[key]
                        delete results[key]
                    }).catch((error) => {
                        new web3.eth.Contract([{
                          "constant": true,
                          "inputs": [],
                          "name": "name",
                          "outputs": [
                            {
                              "name": "",
                              "type": "bytes32"
                            }
                          ],
                          "payable": false,
                          "stateMutability": "pure",
                          "type": "function"
                        }], key).methods.name().call().then((realName) => {
                            if (realName.startsWith('0x0000000000000000000000')) {
                                return
                            }
                            realName = web3.utils.toAscii(realName).trim()
                            if (realName) {
                                addressToName[key] = realName
                                results[realName] = results[key]
                                delete results[key]
                            }
                        })
                    })
                }
                if (results[key] > currentWindowSize / stepSize) {
                    console.log(key + '\t' + results[key] + '\t' +  (results[key] / (currentWindowSize * 15)) + '\t' + ( results[key] / (currentWindowSize / 4)))
                }
            }
        }
        await retry({ fromBlock: end - stepSize, toBlock: end }).then(countKnown).then(prettyPrint.bind(end))
    }
})
