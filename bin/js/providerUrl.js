const fs = require('fs');

const defaultProviderUrl = 'https://mainnet.infura.io';
let customProviderUrl;
try {
  const configPath = __dirname + '/../../config/ethrpc';
  customProviderUrl = fs.readFileSync(configPath, 'utf8');
} catch (e) {
  if (e.code != 'ENOENT') {
    console.error(e)
    console.log('Using', defaultProviderUrl);
  }
}

const providerUrl = customProviderUrl || defaultProviderUrl;

module.exports = providerUrl;
