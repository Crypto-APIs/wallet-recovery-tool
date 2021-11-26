'use strict';

const {CURVE, CURVE_CONFIG} = require("../enumerations/curve");
const BigNumber = require("bignumber.js");
const mathUtils = require("../utils/math");

class Point {

    /**
     * @param {string} x
     * @param {string} y
     */
    constructor(x, y) {
        this.x = x.startsWith("0x") ? x : "0x" + x;
        this.y = y.startsWith("0x") ? y : "0x" + y;
        this.xBN = new BigNumber(this.x);
        this.yBN = new BigNumber(this.y);
        this.curve = CURVE["SECP256K1"];
        this.curveConfig = CURVE_CONFIG[this.curve];
    }

    /**
     * @return {BigNumber}
     */
    getXBN() {
        return this.xBN;
    }

    /**
     * @return {BigNumber}
     */
    getYBN() {
        return this.yBN;
    }

    /**
     * @param {BigNumber} k
     * @return {Point}
     */
    async mul(k) {
        const q = new BigNumber(this.curveConfig.q)
        const kVal = mathUtils.euclideanMod(k, q);
        const bits = kVal.toString(2).split("").reverse();
        let r0 = new Point("0", "0");
        let r1 = this;

        for (let i = bits.length - 1; i >= 0; i--) {
            if (parseInt(bits[i]) === 0) {
                [r1, r0] = await Promise.all([r1.add(r0), r0.dbl()]).then(values => values.flat());
            } else {
                [r0, r1] = await Promise.all([r0.add(r1), r1.dbl()]).then(values => values.flat());
            }
        }

        return r0;
    }

    /**
     * @param {Point} point
     * @return boolean
     */
    equals(point) {
        let equals = true;
        if (this.curve !== point.curve) {
            equals = false;
        }

        if (this.getXBN().comparedTo(point.getXBN()) !== 0 || this.getYBN().comparedTo(point.getYBN()) !== 0) {
            equals = false;
        }

        return equals;
    }

    /**
     * @param {Point} point
     * @return {Point}
     */
    async add(point) {
        const oPoint = new Point("0", "0");
        const p = new BigNumber(this.curveConfig.p);

        if (this.equals(point)) {
            return this.dbl();
        }

        if (this.equals(oPoint)) {
            return point;
        }

        if (point.equals(oPoint)) {
            return this;
        }

        let tmp1 = point.getYBN().minus(this.getYBN());
        let tmp2 = point.getXBN().minus(this.getXBN());
        tmp2 = mathUtils.modInv(tmp2, p);
        tmp1 = tmp1.multipliedBy(tmp2);
        tmp1 = mathUtils.euclideanMod(tmp1, p);

        let x = tmp1.multipliedBy(tmp1);
        x = mathUtils.euclideanMod(x, p);
        x = x.minus(this.getXBN());
        x = x.minus(point.getXBN());

        let y = this.getXBN().minus(x);
        y = y.multipliedBy(tmp1);
        y = mathUtils.euclideanMod(y, p);
        y = y.minus(this.getYBN());

        return new Point(mathUtils.euclideanMod(x, p).toString(16), mathUtils.euclideanMod(y, p).toString(16));
    }

    /**
     * @return {Point}
     */
    async dbl() {
        const oPoint = new Point("0", "0");
        const p = new BigNumber(this.curveConfig.p);
        if (this.equals(oPoint)) {
            return this;
        }

        let tmp1 = this.getXBN().multipliedBy(this.getXBN());
        tmp1 = mathUtils.euclideanMod(tmp1, p);
        tmp1 = tmp1.multipliedBy(3);
        tmp1 = tmp1.plus(this.curveConfig.a);

        let tmp2 = this.getYBN().plus(this.getYBN());
        tmp2 = mathUtils.modInv(tmp2, p);
        tmp1 = tmp1.multipliedBy(tmp2);
        tmp1 = mathUtils.euclideanMod(tmp1, p);

        let x = tmp1.multipliedBy(tmp1);
        x = mathUtils.euclideanMod(x, p);
        tmp2 = this.getXBN().plus(this.getXBN());
        x = x.minus(tmp2);

        let y = this.getXBN().minus(x);
        y = y.multipliedBy(tmp1);
        y = mathUtils.euclideanMod(y, p);
        y = y.minus(this.getYBN());

        const finalX = mathUtils.euclideanMod(x, p).toString(16)
        const finalY = mathUtils.euclideanMod(y, p).toString(16);

        return new Point(finalX, finalY);
    }
}

module.exports = Point;