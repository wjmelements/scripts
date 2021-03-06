const web3 = require('./web3.js');

const TrueUSDAbi = require('../abi/trueUsdAbi.json')

require('colors')

const tokens = [
  {
    address: '0x0000000000085d4780B73119b644AE5ecd22b376',
    name: 'TrueUSD',
  },
  {
    address: '0x00000000441378008EA67F4284A57932B1c000a5',
    name: 'TrueGBP',
  },
  {
    address: '0x00006100F7090010005F1bd7aE6122c3C2CF0090',
    name: 'TrueAUD',
  },
  {
    address: '0x00000100F2A2bd000715001920eB70D229700085',
    name: 'TrueCAD',
  },
  {
    address: '0x0000852600CEB001E08e00bC008be620d60031F2',
    name: 'TrueHKD',
  },
];

function showTokenPool(i) {
  const { address, name } = tokens[i];
  return new Promise((resolve, reject) => {
    new web3.eth.Contract(TrueUSDAbi, address).methods.remainingGasRefundPool().call().then((pool) => {
      console.log(name.bold)
      let poolStr = String(Number(pool))
      if (pool < 1800) {
        poolStr = poolStr.red;
      } else if (pool < 6000) {
        poolStr = poolStr.yellow;
      } else {
        poolStr = poolStr.green;
      }
      console.log(poolStr, 'SSTORE');
      web3.eth.getStorageAt(address, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').then((storage) => {
        const size = web3.utils.toDecimal(storage);
        let sizeStr = String(size);
        if (size < 600) {
          sizeStr = sizeStr.red;
        } else if (size < 2000) {
          sizeStr = sizeStr.yellow;
        } else {
          sizeStr = sizeStr.green;
        }
        console.log(sizeStr, 'SELFDESTRUCT');
        if (i + 1 < tokens.length) {
          showTokenPool(i+1)
        }
      })
    })
  });
}

showTokenPool(0)
