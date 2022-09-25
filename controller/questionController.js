"use strict";
let questionStore = require("../store/questionStore");

async function insert(data) {
    await questionStore.insert(data);
}

async function findAll(options) {
    return await questionStore.findAll(options);
}

/*
 * Dice details is dictionary containing dice_no, user_id, round_no, color, room_id
*/
async function getQuestionForUserIdForRoom(dice_details, options = {}) {
    return await questionStore.getQuestionForUserIdForRoom(dice_details, options);
}

async function getQuestionById(id, options={}) {
    return await questionStore.getQuestionById(id, options);
}

exports.insert = insert;
exports.findAll = findAll;
exports.getQuestionForUserIdForRoom = getQuestionForUserIdForRoom;
exports.getQuestionById = getQuestionById;