'use strict';

const { dialog } = require('electron');
const BaseService = require('./base');

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
                { name: 'JSON', extensions: ['json'] },
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
        }

        this.mainWindow.webContents.send("status:recovery-data", status);

        return fileData;
    }

    /**
     * @return {Promise<Electron.OpenDialogReturnValue>}
     */
    async recoverRsaKey() {
        const fileData = await dialog.showOpenDialog({
            properties: ['openFile']
        });

        let status = true;
        if (!fileData.canceled) {
            const recoveryDataJson = await this.getJsonFromFile(fileData.filePaths[0]);
            if (!recoveryDataJson) {
                status = false;
            } else {
                const validationResponse = this.validator.validatePrivateKey(recoveryDataJson);
                if (validationResponse) {
                    status = false;
                }
            }
        }

        this.mainWindow.webContents.send("status:rsa-key", status);

        return fileData;
    }
}

module.exports = FileService;