/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/medicrypt.json`.
 */
export type Medicrypt = {
  "address": "2khvaPnKAhpdCi31KWd5ZLYsWBQxjs9v3J1HAbC1hEqP",
  "metadata": {
    "name": "medicrypt",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deactivateRecord",
      "docs": [
        "Marks a record metadata account as inactive. Only the owner can do this.",
        "This is a \"soft delete\". Associated AccessGrant accounts are not automatically affected",
        "but new grants cannot be made for an inactive record."
      ],
      "discriminator": [
        190,
        234,
        211,
        18,
        159,
        199,
        73,
        189
      ],
      "accounts": [
        {
          "name": "recordMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "record_metadata.cid",
                "account": "recordMetadata"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "grantAccess",
      "docs": [
        "Grants access to a specific record for a requester.",
        "Only the owner of the record can call this.",
        "The `re_encrypted_symmetric_key` is the original symmetric key,",
        "re-encrypted by the owner (off-chain) using the requester's public key."
      ],
      "discriminator": [
        66,
        88,
        87,
        113,
        39,
        22,
        27,
        165
      ],
      "accounts": [
        {
          "name": "recordMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "record_metadata.owner",
                "account": "recordMetadata"
              },
              {
                "kind": "account",
                "path": "record_metadata.cid",
                "account": "recordMetadata"
              }
            ]
          }
        },
        {
          "name": "accessGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  114,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "recordMetadata"
              },
              {
                "kind": "arg",
                "path": "requesterPubkey"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "If requester could revoke, this would be a Signer."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "requesterPubkey",
          "type": "pubkey"
        },
        {
          "name": "reEncryptedSymmetricKey",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerRecord",
      "docs": [
        "Registers metadata for a new encrypted medical record.",
        "The owner is implicitly the signer (patient)."
      ],
      "discriminator": [
        103,
        97,
        165,
        251,
        237,
        159,
        114,
        203
      ],
      "accounts": [
        {
          "name": "recordMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "arg",
                "path": "cid"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "cid",
          "type": "string"
        },
        {
          "name": "encryptedDataHash",
          "type": "string"
        },
        {
          "name": "fileName",
          "type": "string"
        },
        {
          "name": "initialSymmetricKeyEncryptedForOwner",
          "type": "string"
        }
      ]
    },
    {
      "name": "revokeAccess",
      "docs": [
        "Revokes access previously granted.",
        "Can be called by the record owner (granter) or the requester (if they want to relinquish access).",
        "For simplicity here, only owner revokes."
      ],
      "discriminator": [
        106,
        128,
        38,
        169,
        103,
        238,
        102,
        147
      ],
      "accounts": [
        {
          "name": "recordMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "record_metadata.owner",
                "account": "recordMetadata"
              },
              {
                "kind": "account",
                "path": "record_metadata.cid",
                "account": "recordMetadata"
              }
            ]
          }
        },
        {
          "name": "accessGrant",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  114,
                  97,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "recordMetadata"
              },
              {
                "kind": "arg",
                "path": "requesterPubkey"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "If requester could revoke, this would be a Signer."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "accessGrant",
      "discriminator": [
        167,
        55,
        184,
        237,
        74,
        242,
        0,
        109
      ]
    },
    {
      "name": "recordMetadata",
      "discriminator": [
        201,
        128,
        227,
        250,
        138,
        99,
        235,
        75
      ]
    }
  ],
  "events": [
    {
      "name": "accessGranted",
      "discriminator": [
        21,
        212,
        83,
        192,
        198,
        26,
        62,
        185
      ]
    },
    {
      "name": "accessRevoked",
      "discriminator": [
        200,
        160,
        73,
        43,
        201,
        165,
        43,
        159
      ]
    },
    {
      "name": "recordDeactivated",
      "discriminator": [
        219,
        40,
        18,
        254,
        35,
        186,
        123,
        203
      ]
    },
    {
      "name": "recordRegistered",
      "discriminator": [
        94,
        164,
        33,
        178,
        82,
        149,
        25,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedOwner",
      "msg": "Unauthorized: Signer is not the owner of the record."
    },
    {
      "code": 6001,
      "name": "recordNotActive",
      "msg": "Record is not active. Operations cannot be performed."
    },
    {
      "code": 6002,
      "name": "grantNotActive",
      "msg": "Access grant is not active."
    },
    {
      "code": 6003,
      "name": "invalidGrantState",
      "msg": "Invalid grant state for operation."
    },
    {
      "code": 6004,
      "name": "stringTooLong",
      "msg": "String is too long for defined account space."
    }
  ],
  "types": [
    {
      "name": "accessGrant",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recordPda",
            "type": "pubkey"
          },
          {
            "name": "requester",
            "type": "pubkey"
          },
          {
            "name": "granter",
            "type": "pubkey"
          },
          {
            "name": "reEncryptedSymmetricKey",
            "type": "string"
          },
          {
            "name": "grantedAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "accessGranted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "grantPda",
            "type": "pubkey"
          },
          {
            "name": "recordPda",
            "type": "pubkey"
          },
          {
            "name": "granter",
            "type": "pubkey"
          },
          {
            "name": "requester",
            "type": "pubkey"
          },
          {
            "name": "grantedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "accessRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "grantPda",
            "type": "pubkey"
          },
          {
            "name": "recordPda",
            "type": "pubkey"
          },
          {
            "name": "granter",
            "type": "pubkey"
          },
          {
            "name": "requester",
            "type": "pubkey"
          },
          {
            "name": "revokedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "recordDeactivated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recordPda",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "deactivatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "recordMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "cid",
            "type": "string"
          },
          {
            "name": "encryptedDataHash",
            "type": "string"
          },
          {
            "name": "fileName",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "ownerEncryptedSymmetricKey",
            "type": "string"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "recordRegistered",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recordPda",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "cid",
            "type": "string"
          },
          {
            "name": "encryptedDataHash",
            "type": "string"
          },
          {
            "name": "fileName",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
