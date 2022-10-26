'use strict';

const RecoveryToolService = require("../src/lib/services/recoveryToolService");
const fs = require("fs").promises;
const RecoveryDataEntity = require("../src/lib/entities/recoveryDataEntity");
const privateKeyType = require("../src/lib/enumerations/privateKeyType.js");

(async () => {
    const exampleDataDir = __dirname + "/data/";
    const recoveryData = await fs.readFile(exampleDataDir + "recovery_data.json");
    const privateKeyData = await fs.readFile(exampleDataDir + "private_key.txt");
    const recoveryDataJson = JSON.parse(recoveryData.toString());

    const recoveryDataEntity = new RecoveryDataEntity(recoveryDataJson);
    const tool = new RecoveryToolService();
    console.time("recover")
    const xprv = tool.recoverXpriv(recoveryDataEntity, privateKeyData, privateKeyType.RAW_PEM);
    console.timeEnd("recover")
    console.log(xprv);
})();