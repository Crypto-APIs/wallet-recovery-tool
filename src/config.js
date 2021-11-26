const path = require('path');

const mainWindowWidth = 800;
const mainWindowHeight = 600;
const aboutWindowWidth = 300;
const aboutWindowHeight = 200;
const generatePasswordLength = 12;

const preloadFilePath = path.join(__dirname, 'preload.js')
const indexHtmlFilePath = path.join(__dirname, 'views/index.html');
const aboutHtmlFilePath = path.join(__dirname, 'views/about.html');
const passwordGeneratorHtmlFilePath = path.join(__dirname, 'views/password-generator.html');
const recoverCryptoapisProvidedHtmlFilePath = path.join(__dirname, 'views/recover-cryptoapis-provided.html');
const recoverSelfProvidedHtmlFilePath = path.join(__dirname, 'views/recover-self-provided.html');
const rsaKeyGeneratorHtmlFilePath = path.join(__dirname, 'views/rsa-key-generator.html');

let isMac = false;
let iconFilePath;
let toggleDevToolsAccelerator;
let mainMenuFileSubmenuRole;
switch (process.platform) {
    case 'linux':
        iconFilePath = path.join(__dirname, './resources/icons/256x256.png');
        toggleDevToolsAccelerator = 'Ctrl+I';
        mainMenuFileSubmenuRole = 'quit';
        break;
    case "win32":
        iconFilePath = path.join(__dirname, './resources/icons/128x128.ico');
        toggleDevToolsAccelerator = 'Ctrl+I';
        mainMenuFileSubmenuRole = 'quit';
        break;
    case "darwin":
        isMac = true;
        iconFilePath = path.join(__dirname, './resources/icons/128x128.icns');
        toggleDevToolsAccelerator = 'Command+I';
        mainMenuFileSubmenuRole = 'close';
        break;
    default:
        iconFilePath = path.join(__dirname, './resources/icons/128x128.ico');
        toggleDevToolsAccelerator = 'Ctrl+I';
        mainMenuFileSubmenuRole = 'quit';
        break;
}

const mainWindowOptions = {
    width: mainWindowWidth,
    height: mainWindowHeight,
    webPreferences: {
        preload: preloadFilePath,
    },
    icon: iconFilePath,
}

const aboutWindowOptions = {
    width: aboutWindowWidth,
    height: aboutWindowHeight,
    frame: false,
}

const generatePasswordOptions = {
    length: generatePasswordLength,
    numbers: true,
    symbols: true,
    uppercase: true,
    strict: true,
}

const mainMenuOptions = [
    {
        label: 'File',
        submenu: [
            {
                role: mainMenuFileSubmenuRole
            },
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Crypto APIs Website',
                click: async () => {
                    const {shell} = require('electron')
                    await shell.openExternal('https://cryptoapis.io')
                }
            },
            {
                label: 'Developers Portal',
                click: async () => {
                    const {shell} = require('electron')
                    await shell.openExternal('https://developers.cryptoapis.io')
                }
            },
            {
                label: 'Contact us',
                click: async () => {
                    const {shell} = require('electron')
                    await shell.openExternal('https://cryptoapis.io/contacts')
                }
            },
        ]
    }
];

const mainMenuOptionsDev = {
    label: 'Developer Tools',
    submenu: [
        {
            role: 'reload',
        },
        {
            role: 'toggleDevTools',
            accelerator: toggleDevToolsAccelerator,
        }
    ]
}

module.exports = {
    IS_MAC: isMac,
    MAIN_WINDOW_WIDTH: mainWindowWidth,
    MAIN_WINDOW_HEIGHT: mainWindowHeight,
    PRELOAD_FILE_PATH: preloadFilePath,
    ICON_FILE_PATH: iconFilePath,
    MAIN_WINDOW_OPTIONS: mainWindowOptions,
    ABOUT_WINDOW_OPTIONS: aboutWindowOptions,
    GENERATE_PASSWORD_OPTIONS: generatePasswordOptions,
    INDEX_HTML_FILE_PATH: indexHtmlFilePath,
    ABOUT_HTML_FILE_PATH: aboutHtmlFilePath,
    GENERATE_PASSWORD_LENGTH: generatePasswordLength,
    MAIN_MENU_OPTIONS: mainMenuOptions,
    MAIN_MENU_OPTIONS_DEV: mainMenuOptionsDev,
    PASSWORD_GENERATOR_HTML_FILE_PATH: passwordGeneratorHtmlFilePath,
    RECOVER_CRYPTOAPIS_PROVIDED_HTML_FILE_PATH: recoverCryptoapisProvidedHtmlFilePath,
    RECOVER_SELF_PROVIDED_HTML_FILE_PATH: recoverSelfProvidedHtmlFilePath,
    RSA_KEY_GENERATOR_HTML_FILE_PATH: rsaKeyGeneratorHtmlFilePath,
}