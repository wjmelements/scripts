const web3 = require('./web3.js')
const { getControllerAddress, addressToName } = require('./getTokenAddress.js')
const { CALL_BATCH_SIZE } = require('./config.js')
const allTokenControllers = require('./allTokenControllers.js')

// controller -> MintOperation[]
async function fetchPendingRequestMints(controller) {
    const pendingMints = []
    const count = await controller.methods.mintOperationCount().call().then(Number)
    const batches = []
    let batch;
    for (let i = 0; i < count; i++) {
        if (i % CALL_BATCH_SIZE == 0) {
            batch = new web3.eth.BatchRequest()
            batch.startI = i
            batches.push(batch)
        }
        batch.add(controller.methods.mintOperations(i).call.request({}, 'latest', (err, result) => {
            if (err) {
                console.error(err)
            }
            if (Number(result.to) || Number(result.value)) {
                pendingMints[i] = result
            }
        }))
    }
    const promises = []
    for (let batch of batches) {
        promises.push(batch.execute().catch(console.error))
    }
    await Promise.all(promises)
    let out = addressToName[controller.options.address] + '\n'
    let none = true
    for (let i = 0; i < count; i++) {
        const pendingMint = pendingMints[i]
        if (pendingMint) {
            none = false
            out += String(i) + '\t' + JSON.stringify({
                to: pendingMint.to,
                value: pendingMint.value.toString(10),
                blockNumber: pendingMint.requestedBlock.toString(10),
                approvals: pendingMint.numberOfApproval.toString(10),
                paused: pendingMint.paused,
            }) + '\n'
        }
    }
    if (none) {
        out += '\t(none)\n'
    }
    process.stdout.write(out)
}
let args = process.argv.slice(2)
async function printPendingMints(tokenControllers) {
    const promises = []
    for (let controller of tokenControllers) {
        promises.push(fetchPendingRequestMints(controller))
    }
    await Promise.all(promises)
}

let tokenControllers = []
for (let arg of args) {
    const controllerName = addressToName[getControllerAddress(arg)]
    if (controllerName in allTokenControllers) {
        tokenControllers.push(allTokenControllers[controllerName])
    }
}
if (!tokenControllers.length) {
    tokenControllers = Object.values(allTokenControllers)
}
printPendingMints(tokenControllers)
