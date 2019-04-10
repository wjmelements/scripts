web3 = require('./web3.js')

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)

const BATCH_SIZE = 2500;

async function run() {
  const length = 0x100000;
  for (let i = 0; i < length; i += BATCH_SIZE) {
    const batch = new web3.eth.BatchRequest();
    for (let j = i; j < length && j < i + BATCH_SIZE; j++) {
      const address = web3.utils.toChecksumAddress(web3.utils.padLeft(web3.utils.toHex(j), 40));
      batch.add(TrueUSD.methods.balanceOf(address).call.request({}, 'latest', (err, result) => {
        if (err) {
          if (err.message !== "Returned values aren't valid, did it run Out of Gas?") {
            console.error(err);
          }
          return;
        }
        if (Number(result)) {
          console.log(address, Number(result) / 1e18);
        }
      }));
    }
    await batch.execute().catch(async function(error) {
      if (!error.message.startsWith("BatchRequest error")) {
        console.error(error);
      }
      // retry
      length = await TrueUSD.methods.remainingGasRefundPool().call();
      i -= BATCH_SIZE;
    });
  }
}
run();
