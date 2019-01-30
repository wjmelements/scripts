web3 = require('./web3.js');

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

function printLine({ start, end, value }) {
  console.log(`${start} - ${end}:\t${value}\t[${end - start + 1}]`);
}

async function run() {
  const len = await TrueUSD.methods.remainingGasRefundPool().call();
  let arr = [];
  for (let i = 0; i < len; i += 2575) {
    const batch = new web3.eth.BatchRequest();
    for (let j = i; j < len && j < i + 2575; j++) {
      batch.add(TrueUSD.methods.gasRefundPool(j).call.request({}, 'latest', (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
        arr[j] = result;
      }));
    }
    await batch.execute();
  }
  let start = 0;
  let end = 0;
  let value = arr[0];
  for (let i = 1; i < len; i++) {
    if (value != arr[i]) {
      printLine({
        start,
        end,
        value
      });
      start = i;
      value = arr[i];
    }
    end = i;
  }
  printLine({
    start,
    end: len - 1,
    value
  });
}

run();
