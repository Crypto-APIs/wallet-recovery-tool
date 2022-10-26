'use strict';

const BN = require("bn.js");
const EC = require("elliptic").ec;
const {CURVE} = require("../enumerations/curve");

/**
 *
 * @param {number} t
 * @param {BN[]} x
 * @param {BN[]} y
 * @returns {BN}
 */
module.exports.reconstruct = (t, x, y) => {
    if (x.length !== y.length) {
        throw new Error(`Mismatch between number of x and y values`)
    }

    if (x.length < t + 1) {
        throw new Error(`Too few points to interpolate for the given threshold`)
    }

    const ec = new EC(CURVE.SECP256K1);
    const n = ec.curve.n;

    let numerator = new BN(0);
    let denominator = new BN(0);

    for (let i = 0; i < x.length; i++) {
        const lPrime = ((i, x) => {
            let result = new BN(1);
            for (let j = 0; j < x.length; j++) {
                if (i === j) {
                    continue;
                }

                result = result.mul(x[j].sub(x[i]));
            }

            return result;
        })(i, x);

        const value = lPrime.mul(new BN(0).sub(x[i])).invm(n);
        numerator = numerator.add(value.mul(y[i]));
        denominator = denominator.add(value);
    }

    return numerator.mul(denominator.invm(n));
}