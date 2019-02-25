web3 = require('./web3.js');

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

function paddyPrint({ width, string }) {
  for (let i = 0; i + string.length < width; i++) {
    process.stdout.write(' ');
  }
  process.stdout.write(string);
}

let arr = [];
let len = 3000;
function printLine({ start, end, pending }) {
  paddyPrint({ string: `${start} - ${end}: `, width: String(len).length * 2 + 5 })
  paddyPrint({ string: `${arr[start]} `, width: 14 })
  process.stdout.write(`[${end - start + 1}${pending ? ' / ' + (len - start) + ']\r' : ']        \n'}`);
}

let nextPrintStart = 0;
function printLines({ start, end }) {
  for (let i = start; i < end; i++) {
    if (arr[nextPrintStart] != arr[i]) {
      printLine({
        start: nextPrintStart,
        end: i - 1,
      });
      nextPrintStart = i;
    }
  }
  printLine({
    start: nextPrintStart,
    end,
    pending: true
  })
}

const BATCH_SIZE = 2500;

async function run() {
  len = await TrueUSD.methods.remainingGasRefundPool().call();
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
      printLines({ start: i, end: Math.min(i + BATCH_SIZE, len) - 1 });
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
    start: nextPrintStart,
    end: len - 1,
  });
}

run();
