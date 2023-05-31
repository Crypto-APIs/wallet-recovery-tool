'use strict';

const KeyPart = require("./keyPartEntity");
const BaseEntity = require("./baseEntity");
const curveUtils = require("../utils/curve");

class RecoveryDataEntity extends BaseEntity {

    /**
     * @returns {Buffer}
     */
    getMasterChainCodeKey() {
        return this.data['masterChainCodeKey'];
    }

    /**
     * @returns {Buffer}
     */
    getMasterChainCode() {
        return this.data['masterChainCode'];
    }

    /**
     * @return {KeyPartEntity[]}
     */
    getKeyParts() {
        return this.data['keyParts'];
    }

    /**
     * @returns {string}
     */
    getSharingType() {
        return this.data["sharingType"];
    }

    /**
     * @returns {number}
     */
    getVersion() {
        return this.data['version'];
    }

    /**
     * @returns {string}
     */
    getCurve() {
        return this.data["curve"];
    }

    /**
     * @inheritDoc
     */
    _prepareData(data) {
        const publicKey = Buffer.from(data["public_key"], 'base64');
        const curve = curveUtils.extractCurveFromPublicKey(publicKey);

        return {
            keyParts: data['key_parts'].map(keyPartData => new KeyPart(keyPartData)),
            publicKey: publicKey,
            sharingType: data['sharing_type'],
            version: parseInt(data['version']),
            masterChainCode: Buffer.from(data['master_chain_code'], 'base64'),
            masterChainCodeKey: Buffer.from(data['master_chain_code_key'], 'base64'),
            curve: curve
        }
    }

    /**
     * @return {string[]}
     * @protected
     */
    _getRequiredAttributes() {
        return ['key_parts', 'public_key', 'sharing_type', 'version', 'master_chain_code', 'master_chain_code_key'];
    }

    /**
     * @inheritDoc
     */
    _validateAttributes(data) {
        super._validateAttributes(data);
        if (!Array.isArray(data['key_parts']) || data['key_parts'].length === 0) {
            throw new Error('key_parts attribute is empty or not an array');
        }
    }
}

module.exports = RecoveryDataEntity;