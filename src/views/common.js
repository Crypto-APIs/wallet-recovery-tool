// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const homeButton = document.getElementById('home');
const logoLink = document.getElementById('logo');
const generatePasswordButton = document.getElementById('generate-password');
const rsaKeyPairsButton = document.getElementById('rsa-key-pairs');
const recoveryButton = document.getElementById('recovery');
const cryptoapisWalletsLinks = document.querySelectorAll('.cryptoapis-wallets-link');

homeButton.addEventListener('click', () => {
    window.api.send('screen:home');
});

logoLink.addEventListener('click', () => {
    window.api.send('screen:home');
});

generatePasswordButton.addEventListener('click', () => {
    window.api.send('screen:generate-password');
});

rsaKeyPairsButton.addEventListener('click', () => {
    window.api.send('screen:rsa-key-generator');
});

recoveryButton.addEventListener('click', () => {
    window.api.send('screen:recover-self-provided');
});

cryptoapisWalletsLinks.forEach(function(cryptoapisWalletsLink) {
    cryptoapisWalletsLink.addEventListener('click', () => {
        window.api.invoke('utility:open-link', ('https://my.cryptoapis.io/wallets'));
    });
});