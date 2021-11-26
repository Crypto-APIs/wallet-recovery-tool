'use strict'

const {modInv} = require("bigint-mod-arith");
const BigNumber = require("bignumber.js");

/**
 * @param {BigNumber} x
 * @param {BigNumber} y
 * @return {BigNumber}
 */
function euclideanMod(x, y) {
    if (x.lt(0)) {
        const res = x.modulo(y);
        return res.plus(y);
    }

    if (x.lt(y)) {
        return x;
    }

    return x.modulo(y);
}

/**
 * @param {BigNumber} x
 * @param {BigNumber} y
 * @return {BigNumber}
 */
function modInverse(x, y) {
    const res = modInv(BigInt(x.toFixed()), BigInt(y.toFixed()));

    return new BigNumber(res.toString());
}

module.exports = {
    euclideanMod: euclideanMod,
    modInv: modInverse,
}