'use strict';

const RecoveryDataEntity = require('../lib/entities/recoveryDataEntity');
const BaseService = require('./base');
const privateKeyTypeEnum = require("../lib/enumerations/privateKeyType");
const {promises: fs} = require("fs");

class RecoverService extends BaseService {
    constructor() {
        super();
    }

    /**
     * @param {object} event
     * @param {string} dataPath
     * @param {string} rsaPath
     * @param {string} privateKeyType
     * @param {string|null} password
     * @return {Promise<string|null>}
     */
    async recoverWalletXPriv(event, dataPath, rsaPath, privateKeyType, password = null) {
        const recoveryDataJson = await this.getJsonFromFile(dataPath);
        if (!recoveryDataJson) {
            return "Recovery data input file is invalid";
        }

        const recoveryDataValidationResult = this.validator.validateRecoveryData(recoveryDataJson);
        if (recoveryDataValidationResult) {
            return "Recovery data input file validation failed";
        }

        const privateKeyDataJson = privateKeyType.includes(privateKeyTypeEnum.SJCL_ENCRYPTED)
            ? await this.getJsonFromFile(rsaPath)
            : await fs.readFile(rsaPath).catch(_ => null);
        if (!privateKeyDataJson) {
            return "Private RSA key input file is invalid";
        }

        const rsaValidationResult = this.validator.validatePrivateKey(privateKeyDataJson, privateKeyType);
        if (rsaValidationResult) {
            return "Private RSA key input file validation failed";
        }

        if (privateKeyType.includes(privateKeyTypeEnum.SJCL_ENCRYPTED) && !this.validator.validatePassword(password)) {
            return "Password must not be empty and have at least one upper case letter, one number and one special symbol";
        }

        const recoveryDataEntity = new RecoveryDataEntity(recoveryDataJson);
        try {
            return this.recoveryToolService.recoverXpriv(recoveryDataEntity, await this.fs.readFile(rsaPath), privateKeyType, password);
        } catch (e) {
            return e;
        }
    }
}

module.exports = RecoverService;