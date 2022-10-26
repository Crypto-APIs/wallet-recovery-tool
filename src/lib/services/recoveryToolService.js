'use strict';

const NodeRsa = require('node-rsa');
const {CURVE} = require("../enumerations/curve");
const crypto = require("crypto");
const xpubUtils = require('../utils/xpub');
const sjcl = require('sjcl');
const privateKeyTypeEnum = require("../enumerations/privateKeyType");
const EC = require("elliptic").ec;
const BN = require("bn.js");
const lagrange = require("../utils/lagrange");

class RecoveryToolService {

    AES_256_GCM = 'aes-256-gcm';
    GCM_TAG_SIZE = 16;
    ZERO_NONCE = "000000000000000000000000";

    constructor() {
        this.curve = new EC(CURVE.SECP256K1).curve;
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
     * @param {Buffer} privateKeyBuffer
     * @param {string} privateKeyType
     * @param {string|null} password
     * @return {string}
     */
    recoverXpriv(recoveryData, privateKeyBuffer, privateKeyType, password = null) {
        let rsaPrivateKey;
        try {
            rsaPrivateKey = privateKeyType.includes(privateKeyTypeEnum.SJCL_ENCRYPTED)
                ? sjcl.decrypt(password, privateKeyBuffer.toString())
                : privateKeyBuffer.toString();
        } catch (e) {
            throw new Error("Invalid password!");
        }

        const privateKey = this.recoverPrivateKey(recoveryData.getKeyParts(), rsaPrivateKey);
        const chainCode = this.recoverChainCode(recoveryData.getMasterChainCodeKey(), recoveryData.getMasterChainCode(), rsaPrivateKey);

        return xpubUtils.generateXpriv(chainCode, privateKey);
    }

    /**
     * @param {Buffer} masterChainCodeKey
     * @param {Buffer} masterChainCode
     * @param {Buffer} ersPrivateKey
     * @return {string}
     */
    recoverChainCode(masterChainCodeKey, masterChainCode, ersPrivateKey) {
        const decryptedKey = this.rsaDecrypt(masterChainCodeKey, ersPrivateKey);

        return this.aesGcmDecrypt(masterChainCode, decryptedKey);
    }

    /**
     * @param {KeyPartEntity[]} keyParts
     * @param {Buffer} ersPrivateKey
     * @return {string}
     */
    recoverPrivateKey(keyParts, ersPrivateKey) {
        const shares = keyParts.map(part => this.recoverKeyShare(part, ersPrivateKey));

        return shares.reduce((curr, prev) => {
            return curr.mul(prev).mod(this.curve.n)
        }, new BN(1)).toString(16);
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
     * return {BN}
     */
    recoverKeyShare(keyPart, ersPrivateKey) {
        const keyPartValuesEntries = Object.entries(keyPart.getValues());
        const indices = [];
        const values = [];

        for (const [index, value] of keyPartValuesEntries) {
            values.push(value);
            indices.push(new BN(index));
        }

        const candidateIndex = keyPartValuesEntries.length;
        const keyShareCommitment = this.curve.decodePoint(keyPart.getCommitment());
        let keyShare = null;
        for (const [encryptedIndex, encryptedValue] of Object.entries(keyPart.getEncryptedValues())) {
            const decryptedValue = this.rsaDecrypt(encryptedValue, ersPrivateKey);
            indices[candidateIndex] = new BN(encryptedIndex);
            values[candidateIndex] = new BN(decryptedValue.toString('hex'), 16).mod(this.curve.n);

            const candidateKeyShare = lagrange.reconstruct(candidateIndex, indices, values);
            const candidateKeyShareCommitment = this.curve.g.mul(candidateKeyShare);

            if (keyShareCommitment.eq(candidateKeyShareCommitment)) {
                keyShare = candidateKeyShare;
                break;
            }
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
}

module.exports = RecoveryToolService;