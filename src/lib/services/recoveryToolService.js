'use strict';

const NodeRsa = require('node-rsa');
const BigNumber = require('bignumber.js');
const {CURVE_CONFIG, CURVE} = require("../enumerations/curve");
const Point = require("../ellipticcurve/point");
const Field = require("../ellipticcurve/field");
const mathUtils = require("../utils/math");
const crypto = require("crypto");
const xpubUtils = require('../utils/xpub');
const sjcl = require('sjcl');

class RecoveryToolService {

    AES_256_GCM = 'aes-256-gcm';
    GCM_TAG_SIZE = 16;
    ZERO_NONCE = "000000000000000000000000";

    constructor() {
        this.curve = CURVE["SECP256K1"];
        this.curveConfig = CURVE_CONFIG[this.curve];
    }

    /**
     * @param {string} password
     * @return {{privateKey: string, publicKey: string}}
     */
    generateRsaKeyPair(password) {
        const options = {
            modulusLength: 2048,
            namedCurve: 'secp256k1',
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        };

        const {privateKey, publicKey} = crypto.generateKeyPairSync("rsa", options);
        const encryptedPrivateKey = sjcl.encrypt(password, privateKey, {ks: 256, mode: "gcm"});
        return {
            publicKey: publicKey,
            privateKey: encryptedPrivateKey,
        }
    }

    /**
     * @param {RecoveryDataEntity} recoveryData
     * @param {Buffer} encryptedPrivateKey
     * @param {string} password
     * @return {Promise<string|null>}
     */
    async recoverXpriv(recoveryData, encryptedPrivateKey, password) {
        let decryptedPrivateKey;
        try {
            decryptedPrivateKey = sjcl.decrypt(password, encryptedPrivateKey.toString());
        } catch (e) {
            throw new Error("Invalid password!")
        }

        const recoveredPrivateKeyPromise = this.recoverPrivateKey(recoveryData.getKeyParts(), decryptedPrivateKey);
        const recoveredChainCodePromise = this.recoverChainCode(recoveryData.getMasterChainCodeKey(), recoveryData.getMasterChainCode(), decryptedPrivateKey);

        const [privateKey, chainCode] = await Promise.all([recoveredPrivateKeyPromise, recoveredChainCodePromise]);

        return xpubUtils.generateXpriv(Buffer.from(chainCode, 'hex'), privateKey);
    }

    /**
     * @param {Buffer} masterChainCodeKey
     * @param {Buffer} masterChainCode
     * @param {Buffer} ersPrivateKey
     * @return {string}
     */
    async recoverChainCode(masterChainCodeKey, masterChainCode, ersPrivateKey) {
        const decryptedKey = this.rsaDecrypt(masterChainCodeKey, ersPrivateKey);

        return this.aesGcmDecrypt(masterChainCode, decryptedKey);
    }

    /**
     * @param {KeyPartEntity[]} keyParts
     * @param {Buffer} ersPrivateKey
     * @return {string}
     */
    async recoverPrivateKey(keyParts, ersPrivateKey) {
        let result = new BigNumber(1);

        const recoveredSharesPromises = [];
        for (const part of keyParts) {
            recoveredSharesPromises.push(this.recoverKeyShare(part, ersPrivateKey));
        }

        const recoveredShares = await Promise.all(recoveredSharesPromises);
        for (const recoveredShare of recoveredShares) {
            result = result.multipliedBy(recoveredShare);
            result = mathUtils.euclideanMod(result, this.curveConfig.q);
        }

        return result.toString(16);
    }

    /**
     * @param {Buffer} encodedData
     * @param {Buffer} aesKey
     * @return {string}
     */
    aesGcmDecrypt(encodedData, aesKey) {
        const nonce = Buffer.from(this.ZERO_NONCE, 'hex')
        const ciphertext = encodedData.slice(0, encodedData.length - this.GCM_TAG_SIZE);
        const tag = encodedData.slice(encodedData.length - this.GCM_TAG_SIZE);
        const decipher = crypto.createDecipheriv(this.AES_256_GCM, aesKey, nonce);
        decipher.setAuthTag(tag);

        let decodedData = decipher.update(ciphertext, 'hex', 'hex');
        decodedData += decipher.final('hex');
        return decodedData;
    }

    /**
     * @param {KeyPartEntity} keyPart
     * @param {Buffer} ersPrivateKey
     */
    async recoverKeyShare(keyPart, ersPrivateKey) {
        const keyPartValuesEntries = Object.entries(keyPart.getValues());
        const indices = [];
        const values = [];
        const qField = new Field(this.curveConfig.q);
        const gPoint = new Point(this.curveConfig.gx, this.curveConfig.gy);

        for (const [index, value] of keyPartValuesEntries) {
            values.push(value);
            indices.push(new BigNumber(index));
        }

        const candidateIndex = keyPartValuesEntries.length;
        values.push(null);
        indices.push(new BigNumber(-1));
        const keyShareCommitment = this.decodeUncompressedPoint(keyPart.getCommitment());
        let keyShare = null;
        for (const [encryptedIndex, encryptedValue] of Object.entries(keyPart.getEncryptedValues())) {
            const decryptedValue = this.rsaDecrypt(encryptedValue, ersPrivateKey);
            values[candidateIndex] = qField.decodeElement(decryptedValue.toString('hex'));
            indices[candidateIndex] = new BigNumber(encryptedIndex);
            const candidateKeyShare = qField.recombine(new BigNumber(0), candidateIndex, indices, values);
            const candidateKeyShareCommitment = await gPoint.mul(candidateKeyShare);
            if (!keyShareCommitment.equals(candidateKeyShareCommitment)) {
                continue;
            }

            keyShare = candidateKeyShare;
            break;
        }

        if (keyShare === null) {
            throw new Error("Unable to recover share, recovery data encryptions did not match commitment")
        }

        return keyShare;
    }

    /**
     * @param {Buffer} encryptedData
     * @param {Buffer} ersPrivateKey
     * @return {Buffer}
     */
    rsaDecrypt(encryptedData, ersPrivateKey) {
        const rsa = new NodeRsa(ersPrivateKey);
        rsa.setOptions({
            environment: 'browser',
            encryptionScheme: {
                hash: 'sha256',
            }
        });

        try {
            return rsa.decrypt(encryptedData);
        } catch (e) {
            throw new Error("Invalid private key!")
        }
    }

    /**
     * @param {Buffer} commitment
     * @return {Point}
     */
    decodeUncompressedPoint(commitment) {
        const bitLength = BigInt(this.curveConfig.p).toString(2).length;
        const elementSize = Math.floor((bitLength + 7) / 8);

        if (commitment.length === 1 && commitment[0] === 0) {
            return new Point("0x0", "0x0");
        } else {
            if ((commitment.length !== 1 + (2 * elementSize)) || (commitment[0] !== 4)) {
                throw new Error("Invalid point length");
            }

            const x = commitment.slice(1, elementSize + 1).toString('hex');
            const y = commitment.slice(elementSize + 1).toString('hex');

            return new Point(x, y);
        }
    }
}

module.exports = RecoveryToolService;