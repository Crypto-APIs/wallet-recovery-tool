'use strict';

const HDKey = require("hdkey");

/**
 * @param {string} chainCode
 * @param {string} key
 * @return {string}
 */
function generateXpriv(chainCode, key) {
    const hd = new HDKey();
    hd.chainCode = Buffer.from(chainCode, 'hex');
    hd.privateKey = Buffer.from(key, 'hex');

    return hd.deriveChild(0).privateExtendedKey;
}

module.exports = {
    generateXpriv: generateXpriv,
}