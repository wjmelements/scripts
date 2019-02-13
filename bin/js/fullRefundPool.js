web3 = require('./web3.js');

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

function printLine({ start, end, value }) {
  console.log(`${start} - ${end}:\t${value}\t[${end - start + 1}]`);
}

let lastPrinted = 0;
let arr = [];
function printLines({ start, end }) {
  for (let i = start; i < end; i++) {
    if (arr[lastPrinted] != arr[i]) {
      printLine({
        start: lastPrinted,
        end: i - 1,
        value: arr[lastPrinted],
      });
      lastPrinted = i; 
    }
  }
}

const BATCH_SIZE = 2500;

async function run() {
  let len = await TrueUSD.methods.remainingGasRefundPool().call();
  for (let i = 0; i < len; i += BATCH_SIZE) {
    const batch = new web3.eth.BatchRequest();
    for (let j = i; j < len && j < i + BATCH_SIZE; j++) {
      batch.add(TrueUSD.methods.gasRefundPool(j).call.request({}, 'latest', (err, result) => {
        if (err) {
          if (err.message !== "Returned values aren't valid, did it run Out of Gas?") {
            console.error(err);
          }
          return;
        }
        arr[j] = result;
      }));
    }
    await batch.execute().then((results) => {
      if (arr[i] == null) {
        // retry
        i -= BATCH_SIZE;
        return;
      }
      printLines({ start: i, end: Math.min(i + BATCH_SIZE - 1, len) });
    }).catch(async function(error) {
      if (!error.message.startsWith("BatchRequest error")) {
        console.error(error);
      }
      // retry
      len = await TrueUSD.methods.remainingGasRefundPool().call();
      i -= BATCH_SIZE;
    });
  }
  printLine({
    start: lastPrinted,
    end: len - 1,
    value: arr[lastPrinted]
  });
}

run();
