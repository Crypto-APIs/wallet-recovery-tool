'use strict';

const {shell, clipboard} = require('electron');
const generator = require('generate-password');
const BaseService = require('./base');

class UtilityService extends BaseService {
    constructor() {
        super();
    }

    /**
     * @param {Object} e
     * @param {string} password
     * @return {{privateKey: string, publicKey: string}}
     */
    generateRsaKey(e, password) {
        const validation = this.validator.validatePassword(password);
        if (!validation) {
            throw new Error('Password validation failed');
        }

        return this.recoveryToolService.generateRsaKeyPair(password);
    }

    /**
     * @return {string}
     */
    generatePassword() {
        return generator.generate(this.configObject.GENERATE_PASSWORD_OPTIONS);
    }

    /**
     * @param {object} event
     * @param {string} url
     */
    openLinkInBrowser(event, url) {
        shell.openExternal(url);
    }

    /**
     * @param {object} event
     * @param {string} text
     */
    clipboardCopy(event, text) {
        clipboard.writeText(text);
    }
}

module.exports = UtilityService;