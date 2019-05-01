const allAttributes = require('./registryAttributes.js')
const writeAttributeFor = require('./writeAttributeFor.js')
const web3 = require('./web3.js')
const { addressToName, nameToAddress } = require('./getTokenAddress')

const RegistryAddress = '0x0000000000013949F288172bD7E36837bDdC7211'
const RegistryAbi = require('../abi/registryAbi.json')
const Registry = new web3.eth.Contract(RegistryAbi, RegistryAddress)

const args = process.argv.slice(2)

// attribute -> address[]
const subscribers = {}
// address -> attribute[]
const subscriptions = []
// bytes32 -> attribute
const attributesByBytes32 = {}
async function fetchSubscribers(attribute) {
    const attr = attribute.bytes32
    attributesByBytes32[attr] = attribute
    const count = await Registry.methods.subscriberCount(attr).call();
    const promises = []
    let offset = web3.utils.toBN(
      web3.utils.soliditySha3(
        {
          t: 'uint256',
          v: web3.utils.soliditySha3(
              {
                t: 'bytes32',
                v: attr,
              },
              {
                t: 'uint256',
                v: 3,
              }
            )
        },
      )
    );
    for (let i = 0; i < count; i++) {
        promises.push(web3.eth.getStorageAt(
          RegistryAddress,
          offset.add(web3.utils.toBN(i))
        ).then((value) => {
            if (value == '0x0000000000000000000000000000000000000000000000000000000000000000') {
                console.log('unexpected zero found at', attr, i);
            } else {
                const address = web3.utils.toChecksumAddress('0x'+value.slice(-40))
                if (!subscribers[attr]) {
                    subscribers[attr] = []
                }
                if (!subscriptions[address]) {
                    subscriptions[address] = []
                }
                subscribers[attr][i] = address;
                subscriptions[address].push(attribute)
            }
        }))
    }
    await Promise.all(promises);
}

const addresses = []
const attributes = []
for (let arg of args) {
    if (web3.utils.isAddress(arg)) {
        addresses.push(web3.utils.toChecksumAddress(arg))
    } else if (nameToAddress[arg]) {
        addresses.push(web3.utils.toChecksumAddress(nameToAddress[arg]))
    } else if (arg.length == 66 && /0x[a-fA-F0-9]{64}/.exec(arg)) {
        let namedAttribute = undefined
        for (let attribute of allAttributes) {
            for (let i = 0; !namedAttribute && i < 3; i++) {
                if (attribute.bytes32 == arg.toLowerCase()) {
                    namedAttribute = attribute
                    break;
                }
                attribute = writeAttributeFor(attribute)
            }
        }
        if (namedAttribute) {
            attributes.push(namedAttribute)
        } else {
            attributes.push({
                name: arg,
                bytes32: arg.toLowerCase(),
            })
        }
    } else {
        let found = false
        for (let attribute of allAttributes) {
            if (attribute.name.search(arg.toUpperCase()) >= 0) {
                attributes.push(attribute)
                found = true
            }
        }
        if (!found) {
            console.log('Unexpected argument', arg)
        }
    }
}
run(addresses, attributes)
async function run(addresses, attributes) {
    // fetch
    const promises = []
    if (addresses.length) {
        for (let attribute of allAttributes) {
            promises.push(fetchSubscribers(attribute))
            promises.push(fetchSubscribers(writeAttributeFor(attribute)))
            promises.push(fetchSubscribers(writeAttributeFor(writeAttributeFor(attribute))))
        }
    } else {
        for (let attribute of attributes) {
            promises.push(fetchSubscribers(attribute))
        }
    }
    await Promise.all(promises)
    for (let address of addresses) {
        if (!subscriptions[address] || !subscriptions[address].length) {
            if (addressToName[address]) {
                console.log(addressToName[address], '(none)')
            } else {
                console.log(address, '(none)')
            }
            continue
        }
        if (addressToName[address]) {
            console.log(addressToName[address])
        } else {
            console.log(address)
        }
        const addressSubscriptions = subscriptions[address]
        for (let attribute of addressSubscriptions) {
            console.log('\t',attribute.name)
        }
    }
    for (let attribute of attributes) {
        const attrSubscribers = subscribers[attribute.bytes32]
        if (!attrSubscribers) {
            console.log(attribute.name, '(none)')
            continue
        }
        console.log(attribute.name)
        for (let subscriber of attrSubscribers) {
            if (addressToName[subscriber]) {
                console.log('\t', addressToName[subscriber])
            } else {
                console.log('\t', subscriber)
            }
        }
    }
}
