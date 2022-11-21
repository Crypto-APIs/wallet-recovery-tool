const generateRsaKeyButton = document.getElementById("generate-button");
const generateRsaResultContainer = document.getElementById("generate-rsa-result-container");

generateRsaKeyButton.addEventListener('click', () => {
    const password = document.getElementById("password").value;

    generateRsaResultContainer.innerHTML = "<div id=\"loading\" class=\"d-flex justify-content-center\">\n" +
        "<div class=\"spinner-border\" role=\"status\">\n" +
        "<span class=\"visually-hidden\">Loading...</span>\n" +
        "</div>\n" +
        "</div>\n";

    window.api.invoke('utility:generate-rsa-key', (password))
        .then(result => {
            generateRsaResultContainer.innerHTML = `
                <div class="row">
                    <div class="col-6 rsa-key-public-col">
                        <div class="row">
                            Public Key
                        </div>
                        <div class="row">
                            <textarea id="generated-rsa-public-key-result" rows="6" disabled>${result.publicKey}</textarea>
                        </div>
                        <div class="row mt-1">
                            <div class="col text-end">
                                <button id="copy-public-key" type="button" class="btn btn-success">Copy Public Key</button>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 rsa-key-private-col">
                        <div class="row">
                            Encrypted Private Key
                        </div>
                        <div class="row">
                            <textarea id="generated-rsa-private-key-result" rows="6" disabled>${result.privateKey}</textarea>
                        </div>
                        <div class="row mt-1">
                            <div class="col text-end">
                                <button id="download-private-key" type="button" class="btn btn-success">Download Encrypted Private Key</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const publicKeyCopyButton = document.getElementById('copy-public-key');
            const privateKeyDownloadButton = document.getElementById('download-private-key');

            publicKeyCopyButton.addEventListener('click', function () {
                if (result.publicKey) {
                    window.api.invoke('utility:clipboard-copy', (result.publicKey));
                    alert('Public key copied successfully!');
                } else {
                    alert('No public key was generated to be copied!');
                }
            });

            privateKeyDownloadButton.addEventListener('click', function () {
                if (result.privateKey) {
                    const blob = new Blob([result.privateKey]);
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = `private_key.json`;
                    link.click();
                } else {
                    alert('No private key was generated to be downloaded!');
                }
            });
        })
        .catch(function () {
            generateRsaResultContainer.innerHTML =
                '<textarea id="recoveryResult" disabled>Password must not be empty and have at least one upper case letter, one number and one special symbol</textarea>';
        });
});