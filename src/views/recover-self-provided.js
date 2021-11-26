let recoveryDataPath, rsaPath;

const recoveryDataFileButton = document.getElementById("recoveryDataFileButton");
const recoveryDataFileText = document.getElementById("recoveryDataFileText");
recoveryDataFileButton.addEventListener("click", function() {
    window.api.invoke("file:recovery-data").then(result => {
        if (!result.canceled) {
            recoveryDataFileText.innerText = result.filePaths[0];
            recoveryDataPath = result.filePaths[0];
        }
    });
});

const rsaFileButton = document.getElementById("rsaFileButton");
const rsaFileText = document.getElementById("rsaFileText");
rsaFileButton.addEventListener("click", function() {
    window.api.invoke("file:rsa-key").then(result => {
        if (!result.canceled) {
            rsaFileText.innerText = result.filePaths[0];
            rsaPath = result.filePaths[0];
        }
    });
});

const recoverButton = document.getElementById("recoverButton");
const recoveryResultContainer = document.getElementById("recoveryResultContainer");
recoverButton.addEventListener("click", () => {
    const password = document.getElementById("password").value;
    if (!(password.length && password.length > 0)) {
        alert("Password must not be empty!");
        return
    }

    recoveryResultContainer.innerHTML = "<div id=\"loading\" class=\"d-flex justify-content-center\">\n" +
        "<div class=\"spinner-border\" role=\"status\">\n" +
        "<span class=\"visually-hidden\">Loading...</span>\n" +
        "</div>\n" +
        "</div>\n";

    window.api.invoke("recover:recover-xpriv", recoveryDataPath, rsaPath, password).then(result => {
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

