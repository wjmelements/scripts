const web3 = require('./web3.js')
const nameToAddress = {
  TUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
  TrueUSD: '0x0000000000085d4780B73119b644AE5ecd22b376',
  TGBP: '0x00000000441378008EA67F4284A57932B1c000a5',
  TrueGBP: '0x00000000441378008EA67F4284A57932B1c000a5',
  TAUD: '0x00006100F7090010005F1bd7aE6122c3C2CF0090',
  TrueAUD: '0x00006100F7090010005F1bd7aE6122c3C2CF0090',
}
const tokenToController = {
  '0x00000000441378008EA67F4284A57932B1c000a5': '0x00000000BbcF7700A1b403C9EB666f350707b900',
  '0x0000000000085d4780B73119b644AE5ecd22b376': '0x0000000000075EfBeE23fe2de1bd0b7690883cc9',
  '0x00006100F7090010005F1bd7aE6122c3C2CF0090': '0x0000109a8344DE9c00465264006C0000769A2770',
}
function getTokenAddress(name) {
  return nameToAddress[name] || web3.utils.toChecksumAddress(name);
}

function getControllerAddress(name) {
  const tokenAddress = getTokenAddress(name)
  return tokenToController[tokenAddress] || console.error('No known Controller for ', name);
}

if (process.argv[1].endsWith('getTokenAddress.js')) {
  process.stdout.write(getTokenAddress(process.argv[2]))
}

module.exports = {
  getTokenAddress,
  getControllerAddress,
}
