const attributes = require('./registryAttributes.js')
const writeAttributeFor = require('./writeAttributeFor.js')

matchStrings = process.argv.slice(2)

function printAttribute(attribute) {
    console.log(JSON.stringify(attribute, null, 2))
}

let foundMatch = {}
for (let attribute of attributes) {
    for (let i = 0; i < 10; i++) {
        for (let matchString of matchStrings) {
            if (attribute.bytes32.search(matchString.toLowerCase()) >= 0) {
                printAttribute(writeAttributeFor(attribute))
                foundMatch[matchString] = true
            }
            // ensure name matches the exact number of WRITE_
            if (matchString.toUpperCase().startsWith(Array.apply(null, {length:i}).fill('WRITE_').join(''))
              && !matchString.toUpperCase().startsWith(Array.apply(null, {length:i + 1}).fill('WRITE_').join(''))
              && attribute.name.search(matchString.toUpperCase()) >= 0) {
                printAttribute(writeAttributeFor(attribute))
                foundMatch[matchString] = true
            }
        }
        attribute = writeAttributeFor(attribute)
    }
}
for (let matchString of matchStrings) {
    if (!foundMatch[matchString]) {
        if (matchString.length == 66 && /0x[a-fA-F0-9]{64}/.exec(matchString)) {
            fakeAttr = {
                name: '???',
                bytes32: matchString,
            }
            printAttribute(writeAttributeFor(fakeAttr))
        } else {
            console.log('No attribute matching', matchString)
        }
    }
}
