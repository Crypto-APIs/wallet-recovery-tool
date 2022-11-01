'use strict';

const {curves} = require("elliptic");

const curve = {
    SECP256K1: "secp256k1",
    ED25519: "ed25519",
}

const domainParams = {
   [curve.SECP256K1]: curves[curve.SECP256K1],
   [curve.ED25519]: curves[curve.ED25519],
}

module.exports = {
    CURVE: curve,
    DOMAIN_PARAMS: domainParams
};