"use strict";
let redisClient = require("./utilities/redisClient");
let naming_convention = require("./utilities/namingConvention");

// async function setLatestQuestionNoForRoom(room_id) {
//     let key = naming_convention.getLatestQuestionNoForRoomKey(room_id);

//     await redisClient.incr(key, 1);
// }

async function getNextQuestionNoForRoom(room_id) {
    try {
        let key = naming_convention.getLatestQuestionNoForRoomKey(room_id);

        return await redisClient.incr(key, 1);
    } catch(ex) {
        throw ex;
    }
}

async function setQuestionsListForRoom(room_id, question_id) {
    try {
        let key = naming_convention.getQuestionsListForRoomKey(room_id);

        return await redisClient.sadd(key, question_id);
    } catch (ex) {
        throw ex;
    }
}

async function getQuestionsListForRoom(room_id) {
    try {
        let key = naming_convention.getQuestionsListForRoomKey(room_id);

        return await redisClient.smembers(key);
    } catch(ex) {
        throw ex;
    }
}

// exports.setLatestQuestionNoForRoom = setLatestQuestionNoForRoom;
exports.getNextQuestionNoForRoom = getNextQuestionNoForRoom;
exports.setQuestionsListForRoom = setQuestionsListForRoom;
exports.getQuestionsListForRoom = getQuestionsListForRoom;
