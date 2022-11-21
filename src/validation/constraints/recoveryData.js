module.exports = {
    "public_key": {
        "presence": true,
        "type": "string"
    },
    "version": {
        "presence": true,
        "type": "string"
    },
    "sharing_type": {
        "presence": true,
        "type": "string"
    },
    "master_chain_code": {
        "presence": true,
        "type": "string"
    },
    "master_chain_code_key": {
        "presence": true,
        "type": "string"
    },
    "key_parts": {
        "presence": {
            "allowEmpty": false
        },
        "type": "array",
        "objectArray": {
            "commitment": {
                "presence": true,
                "type": "string",
            },
            "values": {
                "presence": true,
                "type": "object",
            },
            "encrypted_values": {
                "presence": true,
                "type": "object",
            },
        },
    }
}