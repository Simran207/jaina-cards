"use strict";
let redisClient = require("./utilities/redisClient");
let naming_convention = require("./utilities/namingConvention");

async function setLatestRoom(room_id) {
    let key = naming_convention.getLatestRoomKey();

    await redisClient.set(key, room_id);
}

async function getLatestRoom() {
    try {
        let key = naming_convention.getLatestRoomKey();

        return await redisClient.get(key, false);
    } catch(ex) {
        throw ex;
    }
}

async function setTurnInRoom(room_id, color) {
    try {
        let key = naming_convention.getTurnInRoomKey(room_id);

        await redisClient.set(key, color);
    } catch (ex) {
        throw ex;
    }
}

async function getTurnInRoom(room_id) {
    try {
        let key = naming_convention.getTurnInRoomKey(room_id);

        return await redisClient.get(key, false);
    } catch(ex) {
        throw ex;
    }
}

async function setIsFirstTimeInRoom(room_id, val) {
    try {
        let key = naming_convention.getIsFirstTimeInRoomKey(room_id);

        await redisClient.set(key, val);
    } catch (ex) {
        throw ex;
    }
}

async function getIsFirstTimeInRoom(room_id) {
    try {
        let key = naming_convention.getIsFirstTimeInRoomKey(room_id);

        return await redisClient.get(key, false);
    } catch(ex) {
        throw ex;
    }
}

exports.setLatestRoom = setLatestRoom;
exports.getLatestRoom = getLatestRoom;
exports.setTurnInRoom = setTurnInRoom;
exports.getTurnInRoom = getTurnInRoom;
exports.setIsFirstTimeInRoom = setIsFirstTimeInRoom;
exports.getIsFirstTimeInRoom = getIsFirstTimeInRoom;
