"use strict";
let scoreStore = require("../store/scoreStore");

async function insert(data) {
    return await scoreStore.insert(data);
}

async function updateScore(score_id, data, options={}) {
    return await scoreStore.updateScore(score_id, data, options);
}

async function isScoreAlreadySubmited(score_id, options) {
    return await scoreStore.isScoreAlreadySubmited(score_id, options);
}

async function getAvgScore(room_id, round_no, options) {
    return await scoreStore.getAvgScore(room_id, round_no, options);
}

exports.insert = insert;
exports.updateScore = updateScore;
exports.isScoreAlreadySubmited = isScoreAlreadySubmited;
exports.getAvgScore = getAvgScore;