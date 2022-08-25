let recoveryDataPath, rsaPath;

const recoveryDataFileButton = document.getElementById("recoveryDataFileButton");
const recoveryDataFileText = document.getElementById("recoveryDataFileText");
recoveryDataFileButton.addEventListener("click", function () {
    window.api.invoke("file:recovery-data").then(result => {
        if (!result.canceled) {
            recoveryDataFileText.innerText = result.filePaths[0];
            recoveryDataPath = result.filePaths[0];
        }
    });
});

const rsaFileButton = document.getElementById("rsaFileButton");
rsaFileButton.addEventListener("click", handlePrivateKeyFileInput);

function handlePrivateKeyFileInput() {
    const rsaFileText = document.getElementById("rsaFileText");
    const privateKeyType = document.getElementById("privateKeySelect").value;
    window.api.invoke("file:rsa-key", privateKeyType).then(result => {
        if (!result.canceled) {
            rsaFileText.innerText = result.filePaths[0];
            rsaPath = result.filePaths[0];
        }
    });
}

const recoverButton = document.getElementById("recoverButton");
const recoveryResultContainer = document.getElementById("recoveryResultContainer");
recoverButton.addEventListener("click", () => {
    const privateKeyType = document.getElementById("privateKeySelect").value;
    const passwordElement = document.getElementById("password");
    if (passwordElement && !(passwordElement.value.length)) {
        alert("Password must not be empty!");
        return
    }

    recoveryResultContainer.innerHTML = "<div id=\"loading\" class=\"d-flex justify-content-center\">\n" +
        "<div class=\"spinner-border\" role=\"status\">\n" +
        "<span class=\"visually-hidden\">Loading...</span>\n" +
        "</div>\n" +
        "</div>\n";

    window.api.invoke("recover:recover-xpriv", recoveryDataPath, rsaPath, privateKeyType, passwordElement?.value).then(result => {
        recoveryResultContainer.innerHTML = `<textarea id="recoveryResult" disabled>${result}</textarea>`;
    });
});

window.api.receive("status:rsa-key", (status) => {
    if (status) {
        document.getElementById("rsaFileStatus").innerHTML = '&#9989;';
    } else {
        document.getElementById("rsaFileStatus").innerHTML = '&#10060;';
    }
});

window.api.receive("status:recovery-data", (status) => {
    if (status) {
        document.getElementById("recoveryDataFileStatus").innerHTML = '&#9989;';
    } else {
        document.getElementById("recoveryDataFileStatus").innerHTML = '&#10060;';
    }
});

document.getElementById("privateKeySelect").addEventListener("change", (data) => {
    const selectValue = document.getElementById("privateKeySelect").value;

    switch (selectValue) {
        case "rawPemPrivateKey":
            document.getElementById("privateKeyContainer").innerHTML = `<div class="row mt-3">\n
                <div class="col input-label">
                    Private RSA key:<span id="rsaFileStatus"></span>
                </div>
                <div class="col">
                    <button id="rsaFileButton" type="button" class="btn btn-secondary">Choose file</button>
                </div>
            </div>
            <div class="row" id="rsaFileText"></div>\n`;

            document.getElementById("rsaFileButton").addEventListener("click", handlePrivateKeyFileInput);

            break;
        case "sjclEncryptedPrivateKey":
            document.getElementById("privateKeyContainer").innerHTML = `<div class="row mt-3">
                        <div class="col input-label">
                            Private RSA key:<span id="rsaFileStatus"></span>
                        </div>
                        <div class="col">
                            <button id="rsaFileButton" type="button" class="btn btn-secondary">Choose file</button>
                        </div>
                    </div>
                    <div class="row" id="rsaFileText"></div>
                    <div class="row mt-3">
                        <div class="col input-label">
                            Private RSA key password:<span id="passwordStatus"></span>
                        </div>
                        <div class="col">
                            <input type="text" id="password" class="form-control"/>
                        </div>
                    </div>
                    <div class="row" id="passwordText"></div>`;

            document.getElementById("rsaFileButton").addEventListener("click", handlePrivateKeyFileInput);

            break;
    }
});
