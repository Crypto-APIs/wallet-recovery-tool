'use strict';

const {CURVE} = require("../enumerations/curve");
const {ec: ECDSA, eddsa: EDDSA} = require("elliptic");

/**
 * @param {string} curve
 * @param {Buffer} encodedPoint
 * @returns {BasePoint}
 */
function decodePoint(curve, encodedPoint) {
    switch (curve) {
        case CURVE.SECP256K1:
            const ecdsa = new ECDSA(CURVE.SECP256K1);
            return ecdsa.curve.decodePoint(encodedPoint);
        case CURVE.ED25519:
            const eddsa = new EDDSA(CURVE.ED25519);
            return eddsa.decodePoint(encodedPoint.toString('hex'));
        default:
            throw new Error("Unknown curve");
    }
}

/**
 * @param {Buffer} publicKey
 * @returns {string}
 */
function extractCurveFromPublicKey(publicKey) {
    for (const curveKey in CURVE) {
        try {
            decodePoint(CURVE[curveKey], publicKey);
            return CURVE[curveKey];
        } catch (_) {}
    }

   throw new Error("Unknown public key format");
}

module.exports = {
    decodePoint: decodePoint,
    extractCurveFromPublicKey: extractCurveFromPublicKey
}