'use strict';

const XPRV_BYTES_LENGTH = 78;
const XPRIV_VERSION = 0x0488ADE4;
const b58 = require('bs58check');
const HDKey = require("hdkey");
const crypto = require("crypto");
const BN = require("bn.js");
const {CURVE, DOMAIN_PARAMS} = require("../enumerations/curve");
const curveUtils = require("./curve");

/**
 * @param {string} curve
 * @param {string} chainCode
 * @param {string} key
 * return {string}
 */
function generateXpriv({curve, chainCode, key}) {
    switch (curve) {
        case CURVE.ED25519:
            return deriveChildEDDSA(key, chainCode, 0);
        case CURVE.SECP256K1:
            const hd = new HDKey();
            hd.chainCode = Buffer.from(chainCode, 'hex');
            hd.privateKey = Buffer.from(key, 'hex');

            return hd.deriveChild(0).privateExtendedKey;
        default:
            throw new Error("Unknown curve");
    }
}

/**
 * @param {string} privateKey
 * @param {string} chainCode
 * @param {number} index
 * @return {string}
 */
function deriveChildEDDSA(privateKey, chainCode, index) {
    const domainParams = DOMAIN_PARAMS[CURVE.ED25519];

    const indexBuff = Buffer.alloc(4);
    indexBuff.writeUInt32LE(index, 0);

    const chainCodeBuff = Buffer.from(chainCode, 'hex');
    const privateKeyBn = new BN(privateKey, 16);

    const masterPublicKeyPoint = domainParams.g.mul(privateKeyBn);
    const masterPublicKey = curveUtils.encodePoint(CURVE.ED25519, masterPublicKeyPoint);

    const data = Buffer.concat([Buffer.from("02", 'hex'), masterPublicKey, indexBuff]);
    const keyOffsetDigest = crypto.createHmac("sha256", chainCodeBuff).update(data).digest("hex");

    const keyOffsetDigestBn = new BN(keyOffsetDigest, 16);

    const derivedChainCode = crypto.createHmac("sha256", chainCodeBuff)
        .update(Buffer.concat([Buffer.from("03", 'hex'), masterPublicKey, indexBuff])).digest();

    const derivedPrivateKey = privateKeyBn.mul(keyOffsetDigestBn).mod(domainParams.n);
    const derivedPublicKeyPoint = domainParams.g.mul(derivedPrivateKey);
    const derivedPublicKey = curveUtils.encodePoint(CURVE.ED25519, derivedPublicKeyPoint);

    return serialize({
        key: derivedPrivateKey.toBuffer(),
        chainCode: derivedChainCode,
        depth: 1,
        fingerprint: generateFingerprint(Buffer.from(derivedPublicKey)),
        index: 0
    });
}

/**
 * @param {Buffer} key
 * @param {Buffer} chainCode
 * @param {number} depth
 * @param {number} fingerprint
 * @param {number} index
 * @return {string}
 */
function serialize({key, chainCode, depth = 0, fingerprint = 0, index = 0}) {
    const buffer = Buffer.allocUnsafe(XPRV_BYTES_LENGTH);
    const preparedKey = Buffer.concat([Buffer.alloc(1, 0), key]);

    buffer.writeUInt8(depth, 4);
    buffer.writeUInt32BE(XPRIV_VERSION, 0);
    buffer.writeUInt32BE(fingerprint, 5);
    buffer.writeUInt32BE(index, 9);
    chainCode.copy(buffer, 13);
    preparedKey.copy(buffer, 45);

    return b58.encode(buffer);
}

/**
 * @param {Buffer} publicKey
 * @return {number}
 */
function generateFingerprint(publicKey) {
    const sha = crypto.createHash('sha256').update(publicKey).digest();
    const ripemd = crypto.createHash('ripemd160').update(sha).digest();

    return ripemd.subarray(0, 4).readUInt32BE(0)
}

module.exports = {
    generateXpriv: generateXpriv,
}