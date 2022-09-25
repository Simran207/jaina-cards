"use strict";
const userStore = require("../store/userStore");
const debug = require("debug");
const log = debug("roomController:log");
const errorLog = debug("roomController:errorLog"); 
const roomStore = require("../store/roomStore");

async function findRoomById(options) {
    try {
        if (!options || !options.room_id) {
            throw new Error("Please specify room id");
        }
        return await roomStore.findRoomById(options);
    } catch (ex) {
        errorLog(ex);
        throw ex;
    }
}

async function isRoomFull(options) {
    try {
        if (!options || !options.room_id) {
            throw new Error("Please specify room id");
        }
        let room = await roomStore.findRoomById(options);

        if (room && room.red_user_id && room.blue_user_id && room.yellow_user_id && room.green_user_id) {
            return true;
        }
        return false;
    } catch (ex) {
        errorLog(ex);
        throw ex;
    }
}

async function getNextColorTurn(room_id, color, options) {
    try {
        return await roomStore.getNextColorTurn(room_id, color, options);
    } catch (ex) {
        throw ex;
    }
}

async function updateRoom(data, room_id, options) {
    try {
        await roomStore.updateRoom(data, room_id, options);
    } catch (ex) {
        throw ex;
    }
}

async function isGameStarted(room_id, options = {}) {
    try {
        let room  = await findRoomById({room_id: room_id});

        if (room) {
            if (room.is_game_started) {
                return true;
            }
        }
        return false;
    } catch (ex) {
        throw ex;
    }
}

async function isUserAlreadyPresentInRoom(user_id, options={}) {
    return await roomStore.isUserAlreadyPresentInRoom(user_id, options);
}

async function updateRedRoomJoiningTime(room_id, round_no, red_joining_time, options) {
    return await roomStore.updateRedRoomJoiningTime(room_id, round_no, red_joining_time, options);
}

async function updateRoomBlocked(room_id, round_no, is_blocked, options) {
    return await roomStore.updateRoomBlocked(room_id, round_no, is_blocked, options);
}

exports.findRoomById = findRoomById;
exports.isRoomFull = isRoomFull;
exports.getNextColorTurn = getNextColorTurn;
exports.updateRoom = updateRoom;
exports.isGameStarted = isGameStarted;
exports.isUserAlreadyPresentInRoom = isUserAlreadyPresentInRoom;
exports.updateRedRoomJoiningTime = updateRedRoomJoiningTime;
exports.updateRoomBlocked = updateRoomBlocked;
