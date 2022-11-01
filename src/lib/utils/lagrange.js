'use strict';

const BN = require("bn.js");

/**
 * @param {BN[]} indices
 * @param {BN[]} values
 * @param {BN} n
 * @returns {BN}
 */
module.exports.reconstruct = (indices, values, n) => {
    if (indices.length !== values.length) {
        throw new Error(`Mismatch between length of indices and values`)
    }

    let numerator = new BN(0);
    let denominator = new BN(0);

    for (let i = 0; i < indices.length; i++) {
        let temp = new BN(1);
        for (let j = 0; j < indices.length; j++) {
            if (i !== j) {
                temp = temp.mul(indices[j].sub(indices[i]));
            }
        }

        const value = temp.mul(indices[i].neg()).invm(n);
        numerator = numerator.add(value.mul(values[i]));
        denominator = denominator.add(value);
    }

    return numerator.mul(denominator.invm(n));
}