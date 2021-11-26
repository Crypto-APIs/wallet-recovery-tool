'use strict';

const HDKey = require("hdkey");

/**
 * @param {Buffer} chainCode
 * @param {string} key
 * @param {Object} options
 * @param {number|null} options.depth
 * @param {number|null} options.fingerprint
 * @param {number|null} options.version
 * @param {number|null} options.index
 * @return {string|null}
 */
function generateXpriv(chainCode, key, options = {}) {
    const privateKey = key.length % 2 ? `0${key}` : key;

    const hd = new HDKey();
    hd.chainCode = chainCode;
    hd.privateKey = Buffer.from(privateKey, 'hex');

    return hd.deriveChild(0).privateExtendedKey;
}

module.exports = {
    generateXpriv: generateXpriv,
}