'use strict';

const BigNumber = require("bignumber.js");
const mathUtils = require("../utils/math");

class Field {

    /**
     * @param {string} modulus
     */
    constructor(modulus) {
        this.modulus = modulus.startsWith("0x") ? modulus : "0x" + modulus;
        this.modulusBits = BigInt(this.modulus).toString(2);
        this.modulusBN = new BigNumber(this.modulus);
    }

    /**
     * @return {BigNumber}
     */
    getModulusBN() {
        return this.modulusBN;
    }

    /**
     * @param {BigNumber} s
     * @param {number} t
     * @param {BigNumber[]} indices
     * @param {BigNumber[]} vals
     * @return {BigNumber}
     */
    recombine(s, t, indices, vals) {
        if (indices.length < t + 1) {
            throw new Error("Lagrange interpolation requires at least t + 1 points");
        }

        const lagrange = this.lagrange(s, t, indices);
        return this.dot(t, vals, lagrange);
    }

    /**
     * @param {BigNumber} s
     * @param {number} t
     * @param {BigNumber[]} x
     * @return {BigNumber[]}
     */
    lagrange(s, t, x) {
        if (x.length < t + 1) {
            throw new Error(`Too few points: ${x}`)
        }

        const res = [];
        for (let i = 0; i < t + 1; i++) {
            res[i] = new BigNumber(1);
            for (let m = 0; m < t + 1; m++) {
                if (m === i) {
                    continue;
                }

                const lhs = this.subtract(s, x[m]);
                const rhs = this.subtract(x[i], x[m]);
                const c = this.divide(lhs, rhs);
                res[i] = this.multiply(res[i], c);
            }
        }

        return res;
    }

    /**
     * @param {BigNumber} v1
     * @param {BigNumber} v2
     * @return {BigNumber}
     */
    subtract(v1, v2) {
        let r = v1.minus(v2);
        if (r.lt(0)) {
            r = r.plus(this.getModulusBN())
        }

        return r;
    }

    /**
     * @param {BigNumber} v1
     * @param {BigNumber} v2
     * @return {BigNumber}
     */
    divide(v1, v2) {
        const modInv = mathUtils.modInv(v2, this.getModulusBN());
        const r = v1.multipliedBy(modInv);
        return mathUtils.euclideanMod(r, this.getModulusBN());
    }

    /**
     * @param {BigNumber} v1
     * @param {BigNumber} v2
     * @return {BigNumber}
     */
    multiply(v1, v2) {
        const r = v1.multipliedBy(v2);
        return mathUtils.euclideanMod(r, this.getModulusBN());
    }

    /**
     * @param {number} t
     * @param {BigNumber[]} a
     * @param {BigNumber[]} b
     * @return {BigNumber}
     */
    dot(t, a, b) {
        if (a.length < t + 1 || b.length < t + 1) {
            throw new Error("not enough values");
        }
        let res = this.multiply(a[0], b[0]);
        for (let i = 1; i < t + 1; i++) {
            const multiplied = this.multiply(a[i], b[i]);
            res = this.add(res, multiplied);
        }
        return res;
    }

    /**
     * @param {BigNumber} v1
     * @param {BigNumber} v2
     * @return {BigNumber}
     */
    add(v1, v2) {
        const r = v1.plus(v2);
        return mathUtils.euclideanMod(r, this.getModulusBN());
    }

    /**
     * @param {string} element
     * @return {BigNumber}
     */
    decodeElement(element) {
        const mLength = Math.floor((this.modulusBits.length + 7) / 8);
        const elemBuff = Buffer.from(element, 'hex');
        if (elemBuff.length !== mLength) {
            throw new Error("invalid element length");
        }
        return mathUtils.euclideanMod(new BigNumber(element, 16), this.getModulusBN());
    }
}

module.exports = Field;