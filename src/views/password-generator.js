const generatePassword = document.getElementById('generate-new-password-button');
const generatePasswordInput = document.getElementById('generate-new-password-input');
const copyIconElement = document.getElementById('copy-icon');

generatePassword.addEventListener('click', async () => {
    generatePasswordInput.value = await window.api.invoke('utility:generate-password');
});

copyIconElement.addEventListener('click', () => {
    if (generatePasswordInput.value) {
        window.api.invoke('utility:clipboard-copy', (generatePasswordInput.value));
        alert('Password copied successfully!');
    } else {
        alert('No password was generated to be copied!');
    }
});
