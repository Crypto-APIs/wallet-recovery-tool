'use strict';

const { CURVE, PREFIXES } = require("../enumerations/curve");
const { ec: ECDSA, eddsa: EDDSA } = require("elliptic");
const ecdsa = new ECDSA(CURVE.SECP256K1);
const eddsa = new EDDSA(CURVE.ED25519);

/**
 * @param {string} curve
 * @param {Buffer} encodedPoint
 * @returns {BasePoint}
 */
function decodePoint(curve, encodedPoint) {
    switch (curve) {
        case CURVE.SECP256K1:
            return ecdsa.curve.decodePoint(encodedPoint);
        case CURVE.ED25519:
            return eddsa.decodePoint(encodedPoint.toString('hex'));
        default:
            throw new Error("Unknown curve");
    }
}

/**
 * @param {string} curve
 * @param {Point} point
 * @return {Buffer}
 */
function encodePoint(curve, point) {
    switch (curve) {
        case CURVE.SECP256K1:
            return ecdsa.curve.encodePoint(point);
        case CURVE.ED25519:
            return Buffer.from(eddsa.encodePoint(point));
        default:
            throw new Error("Unknown curve");
    }
}

/**
 * @param {Buffer} publicKey
 * @returns {string}
 */
function extractCurveFromPublicKey(publicKey) {
    return Object.keys(PREFIXES).find(curve => publicKey.toString("hex").includes(PREFIXES[curve]));
}

module.exports = {
    decodePoint: decodePoint,
    encodePoint: encodePoint,
    extractCurveFromPublicKey: extractCurveFromPublicKey
}