'use strict';

const RecoveryToolService = require("../src/lib/services/recoveryToolService");
const fs = require("fs").promises;
const RecoveryDataEntity = require("../src/lib/entities/recoveryDataEntity");

(async () => {
    const exampleDataDir = __dirname + "/data/";
    const recoveryData = await fs.readFile(exampleDataDir + "recovery_data.json");
    const privateKeyData = await fs.readFile(exampleDataDir + "private_key.txt");
    const recoveryDataJson = JSON.parse(recoveryData.toString());

    const recoveryDataEntity = new RecoveryDataEntity(recoveryDataJson);
    const tool = new RecoveryToolService();
    console.time("recover")
    const xprv = await tool.recoverXpriv(recoveryDataEntity, privateKeyData);
    console.timeEnd("recover")
    console.log(xprv);
})();