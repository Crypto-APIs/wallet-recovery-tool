'use strict';

const {promises: fs} = require('fs');
const configObject = require('../config');
const RecoveryToolService = require('../lib/services/recoveryToolService');
const Validator = require('../validation/validator');

class BaseService {
    constructor() {
        this.configObject = configObject;
        this.fs = fs;
        this.validator = new Validator();
        this.recoveryToolService = new RecoveryToolService();
    }

    /**
     * @param {string} filePath
     * @return {Promise<object|null>}
     */
    async getJsonFromFile(filePath) {
        try {
            const recoveryData = await this.fs.readFile(filePath);
            return JSON.parse(recoveryData.toString());
        } catch (e) {
            return null;
        }
    }
}

module.exports = BaseService;