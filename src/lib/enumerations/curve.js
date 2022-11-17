'use strict';

const {curves} = require("elliptic");

const SECP256K1_PREFIX = "3056301006072a8648ce3d020106052b8104000a034200";
const ED25519_PREFIX = "302a300506032b6570032100"

const curve = {
    SECP256K1: "secp256k1",
    ED25519: "ed25519",
}

const domainParams = {
    [curve.SECP256K1]: curves[curve.SECP256K1],
    [curve.ED25519]: curves[curve.ED25519],
}

const prefixes = {
    [curve.SECP256K1]: SECP256K1_PREFIX,
    [curve.ED25519]: ED25519_PREFIX,
}

module.exports = {
    CURVE: curve,
    DOMAIN_PARAMS: domainParams,
    PREFIXES: prefixes,
};