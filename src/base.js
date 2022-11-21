'use strict'

const {BrowserWindow, app, Menu} = require('electron');
const {
    INDEX_HTML_FILE_PATH,
    MAIN_WINDOW_OPTIONS,
    MAIN_MENU_OPTIONS,
    MAIN_MENU_OPTIONS_DEV,
    ABOUT_WINDOW_OPTIONS,
    ABOUT_HTML_FILE_PATH,
    IS_MAC,
} = require('./config');

class Base {

    /**
     * @return {Electron.CrossProcessExports.BrowserWindow}
     */
    createWindow() {
        const mainWindow = new BrowserWindow(MAIN_WINDOW_OPTIONS);
        mainWindow.loadFile(INDEX_HTML_FILE_PATH);
        mainWindow.on('closed', function () {
            app.quit();
        });

        return mainWindow;
    }

    createMenu() {
        const template = MAIN_MENU_OPTIONS;
        if (IS_MAC) {
            template.unshift({
                label: app.getName()
            });
        }

        if (process.env.NODE_ENV !== 'production') {
            template.push(MAIN_MENU_OPTIONS_DEV);
        }

        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }

    createAboutWindow() {
        let aboutWindow = new BrowserWindow(ABOUT_WINDOW_OPTIONS);
        aboutWindow.loadFile(ABOUT_HTML_FILE_PATH);
        aboutWindow.on('close', () => {
            aboutWindow = null;
        });
    }
}

module.exports = Base;