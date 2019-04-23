const web3 = require('./web3.js');

const TrueUSDAddress = '0x0000000000085d4780B73119b644AE5ecd22b376';
const TrueGBPAddress = '0x00000000441378008EA67F4284A57932B1c000a5';
const TrueAUDAddress = '0x00006100F7090010005F1bd7aE6122c3C2CF0090';
const TrueUSDAbi = require('../abi/trueUsdAbi.json')
const TrueUSD = new web3.eth.Contract(TrueUSDAbi, TrueUSDAddress)
const TrueGBP = new web3.eth.Contract(TrueUSDAbi, TrueGBPAddress)
const TrueAUD = new web3.eth.Contract(TrueUSDAbi, TrueAUDAddress)

const TUSDControllerAddress = '0x0000000000075EfBeE23fe2de1bd0b7690883cc9';
const TGBPControllerAddress = '0x00000000BbcF7700A1b403C9EB666f350707b900';
const TAUDControllerAddress = '0x0000109a8344DE9c00465264006C0000769A2770';
const ControllerAbi = require('../abi/controllerAbi.json');
const TUSDController = new web3.eth.Contract(ControllerAbi, TUSDControllerAddress);
const TGBPController = new web3.eth.Contract(ControllerAbi, TGBPControllerAddress);
const TAUDController = new web3.eth.Contract(ControllerAbi, TAUDControllerAddress);

const RegistryAddress = '0x0000000000013949F288172bD7E36837bDdC7211';
const RegistryAbi = require('../abi/registryAbi.json');
const Registry = new web3.eth.Contract(RegistryAbi, RegistryAddress);

let result = eval(process.argv[2])
if (result && result.then) {
    result.then(console.log).catch(console.error);
} else {
    console.log(result);
}
