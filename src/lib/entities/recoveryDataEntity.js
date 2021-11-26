'use strict';

const KeyPart = require("./keyPartEntity");
const BaseEntity = require("./baseEntity");

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
     * @inheritDoc
     */
    _prepareData(data) {
        const validationResult = this._validateAttributes(data);
        if (validationResult) {
            throw Error(validationResult);
        }

        return {
            keyParts: data['key_parts'].map(keyPartData => new KeyPart(keyPartData)),
            publicKey: Buffer.from(data['public_key'], 'base64'),
            sharingType: data['sharing_type'],
            version: data['version'],
            masterChainCode: Buffer.from(data['master_chain_code'], 'base64'),
            masterChainCodeKey: Buffer.from(data['master_chain_code_key'], 'base64')
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
        let errorMsg = super._validateAttributes(data);
        if (!errorMsg) {
            if (!Array.isArray(data['key_parts']) || data['key_parts'].length === 0) {
                errorMsg = 'key_parts attribute is empty or not an array';
            }
        }

        return errorMsg;
    }
}

module.exports = RecoveryDataEntity;