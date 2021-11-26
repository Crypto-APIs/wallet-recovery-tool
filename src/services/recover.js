'use strict';

const RecoveryDataEntity = require('../lib/entities/recoveryDataEntity');
const BaseService = require('./base');

class RecoverService extends BaseService {
    constructor() {
        super();
    }

    /**
     * @param {object} event
     * @param {string} dataPath
     * @param {string} rsaPath
     * @param {string} password
     * @return {Promise<string|null>}
     */
    async recoverWalletXPriv(event, dataPath, rsaPath, password) {
        const recoveryDataJson = await this.getJsonFromFile(dataPath);
        if (!recoveryDataJson) {
            return "Recovery data input file is invalid";
        }

        const recoveryDataValidationResult = this.validator.validateRecoveryData(recoveryDataJson);
        if (recoveryDataValidationResult) {
            return "Recovery data input file validation failed";
        }

        const privateKeyDataJson = await this.getJsonFromFile(rsaPath);
        if (!privateKeyDataJson) {
            return "Private RSA kye input file is invalid";
        }

        const rsaValidationResult = this.validator.validatePrivateKey(privateKeyDataJson);
        if (rsaValidationResult) {
            return "Private RSA key input file validation failed";
        }

        if (!this.validator.validatePassword(password)) {
            return "Password must not be empty and have at least one upper case letter, one number and one special symbol";
        }

        const recoveryDataEntity = new RecoveryDataEntity(recoveryDataJson);
        try {
            return await this.recoveryToolService.recoverXpriv(recoveryDataEntity, await this.fs.readFile(rsaPath), password);
        } catch (e) {
            return e;
        }
    }
}

module.exports = RecoverService;