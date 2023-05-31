'use strict';

const {DOMAIN_PARAMS} = require("../enumerations/curve");
const crypto = require("crypto");
const xpubUtils = require('../utils/xpub');
const sjcl = require('sjcl');
const privateKeyTypeEnum = require("../enumerations/privateKeyType");
const BN = require("bn.js");
const lagrange = require("../utils/lagrange");
const curveUtils = require("../utils/curve");
const sharingType = require("../enumerations/sharingType");

class RecoveryToolService {

    /**
     * @param {string} password
     * @return {{privateKey: string, publicKey: string}}
     */
    generateRsaKeyPair(password) {
        const options = {
            modulusLength: 2048,
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

        const privateKey = this.recoverPrivateKey(recoveryData, rsaPrivateKey);
        const chainCode = this.recoverChainCode(recoveryData, rsaPrivateKey);

        return xpubUtils.generateXpriv({curve: recoveryData.getCurve(), chainCode, key: privateKey});
    }

    /**
     * @param {RecoveryDataEntity} recoveryData
     * @param {Buffer} ersPrivateKey
     * @return {string}
     */
    recoverChainCode(recoveryData, ersPrivateKey) {
        const masterChainCode = recoveryData.getMasterChainCode();
        const decryptedKey = crypto.privateDecrypt({key: ersPrivateKey, oaepHash: "sha256"}, recoveryData.getMasterChainCodeKey());

        const gcmTagSize = 16;
        const algorithm = "aes-256-gcm";
        const nonce = Buffer.alloc(12, '00', 'hex');
        const authTag = masterChainCode.subarray(masterChainCode.length - gcmTagSize);

        const decipher = crypto.createDecipheriv(algorithm, decryptedKey, nonce)
            .setAuthTag(authTag);
        const ciphertext = masterChainCode.subarray(0, masterChainCode.length - gcmTagSize);
        const decrypted = decipher.update(ciphertext);

        switch (recoveryData.getVersion()) {
            case 1:
                return decrypted.toString("hex");
            case 2:
            case 3:
                return Buffer.from(JSON.parse(decrypted).master_chain_code, "base64").toString("hex");
        }
    }

    /**
     * @param {RecoveryDataEntity} recoveryDataEntity
     * @param {Buffer} ersPrivateKey
     * @return {string}
     */
    recoverPrivateKey(recoveryDataEntity, ersPrivateKey) {
        const domainParams = DOMAIN_PARAMS[recoveryDataEntity.getCurve()];
        const shares = recoveryDataEntity.getKeyParts().map(part => this.recoverKeyShare(part, ersPrivateKey, recoveryDataEntity.getCurve()));

        const privateKey = shares.reduce((acc, val) => {
            return (sharingType.ADDITIVE.includes(recoveryDataEntity.getSharingType()) ? acc.add(val) : acc.mul(val)).mod(domainParams.n);
        }).toString(16);

        return privateKey.length % 2 ? `0${privateKey}` : privateKey.length < 64 ? `00${privateKey}` : privateKey;
    }

    /**
     * @param {KeyPartEntity} keyPart
     * @param {Buffer} ersPrivateKey
     * @param {string} curve
     * returns {BN}
     */
    recoverKeyShare(keyPart, ersPrivateKey, curve) {
        const domainParams = DOMAIN_PARAMS[curve];
        const keyPartValues = keyPart.getValues();
        const encryptedValues = keyPart.getEncryptedValues();
        const commitment = curveUtils.decodePoint(curve, keyPart.getCommitment());
        const indices = [];
        const values = [];

        for (const key in keyPartValues) {
            values.push(keyPartValues[key]);
            indices.push(new BN(key));
        }

        let keyShare = null;
        for (const key in encryptedValues) {
            const encryptedValue = encryptedValues[key];
            const decryptedValue = crypto.privateDecrypt({key: ersPrivateKey, oaepHash: "sha256"}, encryptedValue);
            indices[indices.length] = new BN(key);
            values[values.length] = new BN(decryptedValue).mod(domainParams.n);

            const candidateKeyShare = lagrange.reconstruct(indices, values, domainParams.n);
            const candidateKeyShareCommitment = domainParams.g.mul(candidateKeyShare);

            if (commitment.eq(candidateKeyShareCommitment)) {
                keyShare = candidateKeyShare;
                break;
            }
        }

        if (keyShare === null) {
            throw new Error("Unable to recover share, recovery data encryptions did not match commitment")
        }

        return keyShare;
    }
}

module.exports = RecoveryToolService;