"use strict";

const crypto = require("crypto");
const base64url = require("base64url");

function generateToken({
    stringBase = "base64",
    byteLength = 48
} = {}) {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(byteLength, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(base64url(buffer));
            }
        });
    });
}

exports.generateToken = generateToken;