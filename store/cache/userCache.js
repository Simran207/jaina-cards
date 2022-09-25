"use strict";
let redisClient = require("./utilities/redisClient");
let naming_convention = require("./utilities/namingConvention");

async function setUserToken(token, val) {
    try {
        let token_key = naming_convention.getUserTokenKey(token);

        await redisClient.setex(token_key, val, 86400 * 3);
    } catch(ex) {
        throw ex;
    }
}

async function getUserToken(token) {
    try {
        let token_key = naming_convention.getUserTokenKey(token);

        return await redisClient.get(token_key, false);
    } catch(ex) {
        throw ex;
    }
}

async function deleteUserToken(token) {
    try {
        let token_key = naming_convention.getUserTokenKey(token);

        await redisClient.del(token_key);
    } catch(ex) {
        throw ex;
    }
}

async function setUserMetaDetails(user_id, room_id, val) {
    try {
        if (typeof val === 'object') {
            val = JSON.stringify(val);
        }

        let key = naming_convention.getUserMetaDetailsKey(user_id, room_id);

        // delete user meta details
        // await redisClient.del(key);

        await redisClient.setex(key, val, 86400 * 3);
    } catch(ex) {
        throw ex;
    }
}

async function getUserMetaDetails(user_id, room_id) {
    try {
        let key = naming_convention.getUserMetaDetailsKey(user_id, room_id);

        return await redisClient.get(key, false);
    } catch(ex) {
        throw ex;
    }
}

async function setUserLoginTime(user_id, round_no, val) {
    try {
        let key = naming_convention.getUserLoginTimeKey(user_id, round_no);

        await redisClient.setex(key, val, 86400 * 3);
    } catch(ex) {
        throw ex;
    }
}

async function getUserLoginTime(user_id, round_no) {
    try {
        let key = naming_convention.getUserLoginTimeKey(user_id, round_no);

        return await redisClient.get(key, false);
    } catch(ex) {
        throw ex;
    }
}

exports.setUserToken = setUserToken;
exports.getUserToken = getUserToken;
exports.setUserMetaDetails = setUserMetaDetails;
exports.getUserMetaDetails = getUserMetaDetails;
exports.deleteUserToken = deleteUserToken;
exports.setUserLoginTime = setUserLoginTime;
exports.getUserLoginTime = getUserLoginTime;
