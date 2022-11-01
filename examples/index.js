'use strict';

const RecoveryToolService = require("../src/lib/services/recoveryToolService");
const fs = require("fs").promises;
const RecoveryDataEntity = require("../src/lib/entities/recoveryDataEntity");
const privateKeyType = require("../src/lib/enumerations/privateKeyType.js");

(async () => {
    const exampleDataDir = __dirname + "/data/";
    const privateKeyData = await fs.readFile(exampleDataDir + "private_key.txt");
    const recoveryDataECDSA = await fs.readFile(exampleDataDir + "recovery_data_ecdsa.json");
    const recoveryDataECDSAJson = JSON.parse(recoveryDataECDSA.toString());

    const recoveryDataEDDSA = await fs.readFile(exampleDataDir + "recovery_data_eddsa.json");
    const recoveryDataEDDSAJson = JSON.parse(recoveryDataEDDSA.toString());

    const recoveryDataEntityECDSA = new RecoveryDataEntity(recoveryDataECDSAJson);
    const recoveryDataEntityEDDSA = new RecoveryDataEntity(recoveryDataEDDSAJson);
    const tool = new RecoveryToolService();

    console.time("recoverECDSA");
    const xprvECDSA = tool.recoverXpriv(recoveryDataEntityECDSA, privateKeyData, privateKeyType.RAW_PEM);
    console.log(xprvECDSA);
    console.timeEnd("recoverECDSA");

    console.time("recoverEDDSA")
    const xprvEDDSA = tool.recoverXpriv(recoveryDataEntityEDDSA, privateKeyData, privateKeyType.RAW_PEM);
    console.log(xprvEDDSA);
    console.timeEnd("recoverEDDSA")
})();