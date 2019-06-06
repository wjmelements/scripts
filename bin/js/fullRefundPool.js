web3 = require('./web3.js');
const { CALL_BATCH_SIZE } = require('./config.js')

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
let length = 3000;
function printLine({ start, end, pending }) {
  paddyPrint({ string: `${start} - ${end}: `, width: String(length).length * 2 + 5 })
  paddyPrint({ string: `${arr[start]} `, width: 14 })
  process.stdout.write(`[${end - start + 1}${pending ? ' / ' + (length - start) + ']\r' : ']        \n'}`);
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

async function run() {
  length = (await TrueUSD.methods.remainingGasRefundPool().call()).length;
  for (let i = 0; i < length; i += CALL_BATCH_SIZE) {
    const batch = new web3.eth.BatchRequest();
    for (let j = i; j < length && j < i + CALL_BATCH_SIZE; j++) {
      batch.add(TrueUSD.methods.gasRefundPool(j).call.request({}, 'latest', (err, result) => {
        if (err) {
          if (err.message !== "Returned values aren't valid, did it run Out of Gas?") {
            console.error(err);
          }
          return;
        }
        arr[j] = result.gasPrice;
      }));
    }
    await batch.execute().then((results) => {
      if (arr[i] == null) {
        // retry
        i -= CALL_BATCH_SIZE;
        return;
      }
      printLines({ start: i, end: Math.min(i + CALL_BATCH_SIZE, length) - 1 });
    }).catch(async function(error) {
      if (!error.message.startsWith("BatchRequest error")) {
        console.error(error);
      }
      // retry
      length = await TrueUSD.methods.remainingGasRefundPool().call();
      i -= CALL_BATCH_SIZE;
    });
  }
  printLine({
    start: nextPrintStart,
    end: length - 1,
  });
}

run();
