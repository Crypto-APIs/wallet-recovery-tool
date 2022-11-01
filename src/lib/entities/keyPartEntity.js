'use strict';

const BaseEntity = require("./baseEntity");
const BN = require("bn.js");

class KeyPartEntity extends BaseEntity {

    /**
     * @return {Object<string, BN>}
     */
    getValues() {
        return this.data['values'];
    }

    /**
     * @return {Object<string, Buffer>}
     */
    getEncryptedValues() {
        return this.data['encryptedValues'];
    }

    /**
     * @return {Buffer}
     */
    getCommitment() {
        return this.data['commitment'];
    }

    /**
     * @inheritDoc
     */
    _prepareData(data) {
        const values = {};
        for (const key in data['values']) {
            values[key] = new BN(Buffer.from(data['values'][key], 'base64'), 16);
        }

        const encryptedValues = {};
        for (const key in data['encrypted_values']) {
            encryptedValues[key] = Buffer.from(data['encrypted_values'][key], 'base64');
        }

        return {
            commitment: Buffer.from(data['commitment'], 'base64'),
            values: values,
            encryptedValues: encryptedValues,
        }
    }

    /**
     * @return {string[]}
     * @protected
     */
    _getRequiredAttributes() {
        return ['commitment', 'values', 'encrypted_values'];
    }
}

module.exports = KeyPartEntity;