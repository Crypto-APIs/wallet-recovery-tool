'use strict';

const BaseEntity = require("./baseEntity");
const BigNumber = require("bignumber.js");

class KeyPartEntity extends BaseEntity {

    /**
     * @return {Object<string, BigNumber>}
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
        const validationResult = this._validateAttributes(data);
        if (validationResult) {
            throw new Error(validationResult);
        }

        const values = {};
        for (const [index, value] of Object.entries(data['values'])) {
            values[index] = new BigNumber(Buffer.from(value, 'base64').toString('hex'), 16);
        }

        const encryptedValues = {};
        for (const [index, value] of Object.entries(data['encrypted_values'])) {
            encryptedValues[index] = Buffer.from(value, 'base64');
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