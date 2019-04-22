module.exports = [
  {
    bytes32: '0x69734465706f7369744164647265737300000000000000000000000000000000',
    name: 'DEPOSIT_ADDRESS',
    addressModifier: (address) => '0x00000' + address.toLowerCase().slice(2, -5),
  },
  {
    bytes32: '0x6973426c61636b6c697374656400000000000000000000000000000000000000',
    name: 'BLACKLISTED',
  },
  {
    bytes32: '0x6973545553444d696e7450617573657273000000000000000000000000000000',
    name: 'MINT_PAUSER',
  },
  {
    bytes32: '0x6973545553444d696e7452617469666965720000000000000000000000000000',
    name: 'MINT_RATIFIER',
  },
  {
    bytes32: '0x697354555344526564656d7074696f6e41646d696e0000000000000000000000',
    name: 'REDEMPTION_ADMIN',
  },
  {
    bytes32: '0x697352656769737465726564436f6e7472616374000000000000000000000000',
    name: 'REGISTERED_CONTRACT',
  },
  {
    bytes32: '0x63616e4275726e00000000000000000000000000000000000000000000000000',
    name: 'CAN_BURN',
  },
  {
    bytes32: '0x6861735061737365644b59432f414d4c00000000000000000000000000000000',
    name: 'PASSED_KYCAML',
  },
  {
    bytes32: '0x63616e536574467574757265526566756e644d696e4761735072696365000000',
    name: 'SET_FUTURE_REFUND_MIN_GAS_PRICE',
  },
  {
    bytes32: '0x63616e4275726e47425000000000000000000000000000000000000000000000',
    name: 'CAN_BURN_GBP',
  },
  {
    bytes32: '0x63616e4275726e41554400000000000000000000000000000000000000000000',
    name: 'CAN_BURN_AUD',
  },
];
