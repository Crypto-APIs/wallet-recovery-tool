'use strict';

const BaseService = require('./base');

class ScreenService extends BaseService {
    constructor(mainWindow) {
        super();
        this.mainWindow = mainWindow;
    }

    renderHomeView() {
        this.mainWindow.loadFile(this.configObject.INDEX_HTML_FILE_PATH);
    }

    renderPasswordGeneratorView() {
        this.mainWindow.loadFile(this.configObject.PASSWORD_GENERATOR_HTML_FILE_PATH);
    }

    renderRsaKeyGeneratorView() {
        this.mainWindow.loadFile(this.configObject.RSA_KEY_GENERATOR_HTML_FILE_PATH);
    }

    renderRecoverSelfProvidedView() {
        this.mainWindow.loadFile(this.configObject.RECOVER_SELF_PROVIDED_HTML_FILE_PATH);
    }

    renderRecoverCryptoapisProvidedView() {
        this.mainWindow.loadFile(this.configObject.RECOVER_CRYPTOAPIS_PROVIDED_HTML_FILE_PATH);
    }
}

module.exports = ScreenService;