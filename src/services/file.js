'use strict';

const {dialog} = require('electron');
const BaseService = require('./base');
const privateKeyTypeEnum = require("../lib/enumerations/privateKeyType");
const {promises: fs} = require('fs');

class FileService extends BaseService {
    constructor(mainWindow) {
        super();
        this.mainWindow = mainWindow;
    }

    /**
     * @return {Promise<Electron.OpenDialogReturnValue>}
     */
    async recoveryData() {
        const fileData = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {name: 'JSON', extensions: ['json']},
            ]
        });

        let status = true;
        if (!fileData.canceled) {
            const recoveryDataJson = await this.getJsonFromFile(fileData.filePaths[0]);
            if (!recoveryDataJson) {
                status = false;
            } else {
                const validationResponse = this.validator.validateRecoveryData(recoveryDataJson);
                if (validationResponse) {
                    status = false;
                }
            }

            this.mainWindow.webContents.send("status:recovery-data", status);
        }

        return fileData;
    }

    /**
     * @param {object} event
     * @param {string} privateKeyType
     * @return {Promise<Electron.OpenDialogReturnValue>}
     */
    async recoverRsaKey(event, privateKeyType) {
        const fileData = await dialog.showOpenDialog({
            properties: ['openFile']
        });

        let status = true;
        if (!fileData.canceled) {
            const privateKey = privateKeyType.includes(privateKeyTypeEnum.SJCL_ENCRYPTED)
                ? await this.getJsonFromFile(fileData.filePaths[0])
                : await fs.readFile(fileData.filePaths[0]).catch(_ => null);

            if (!privateKey) {
                status = false;
            } else {
                const validationResponse = this.validator.validatePrivateKey(privateKey, privateKeyType);
                if (validationResponse) {
                    status = false;
                }
            }

            this.mainWindow.webContents.send("status:rsa-key", status);
        }

        return fileData;
    }
}

module.exports = FileService;