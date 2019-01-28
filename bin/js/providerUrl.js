const defaultProviderUrl = 'https://mainnet.infura.io';
let customProviderUrl;
try {
  const configPath = __dirname + '/../../config/ethrpc';
  customProviderUrl = fs.readFileSync(configPath, 'utf8');
} catch (e) {}

const providerUrl = customProviderUrl || defaultProviderUrl;

module.exports = providerUrl;
