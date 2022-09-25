"use strict";

let Score = require("../model/score");
const db = require("../config/config").db;
const { Op } = require("sequelize");
const randomstring = require("randomstring");

async function insert(data, options = {}) {
    try {
        const id = randomstring.generate({
            length: 8,
            charset: 'alphanumeric'
        });
        let final_data = {
            id: id
        };
        if (data.user_id) {
            final_data.user_id = data.user_id;
        }
        if (data.room_id) {
            final_data.room_id = data.room_id;
        }
        if (data.question_id) {
            final_data.question_id = data.question_id;
        }
        if (data.round_no) {
            final_data.round_no = data.round_no;
        }
        if (data.dice_no) {
            final_data.dice_no = data.dice_no;
        }
        final_data.is_answered = false;
        final_data.duration = 0;

        // await db.sequelize.sync({force: true});
        let score = await Score.create(final_data);
        return score;
    } catch(ex) {
        throw ex;
    }
}

function getScoreById(id, options) {
    try {
        if (!id) {
            throw new Error("Please specify score id");
        }
        return Score.findOne({
            where: {
                [Op.and]: [{
                    id: id
                }]
            }
        });
    } catch (ex) {
        throw ex;
    }
}

async function updateScore(score_id, data, options) {
    try {
        if (!score_id) {
            throw new Error("Please specify the score_id");
        }
    
        let score = await getScoreById(score_id);
        if (score && score.length > 0) {
            score = score[0];
        }

        if (score.is_answered) {
            return score;
        }
    
        let final_data = {};
    
        final_data.is_answered = data.is_answered;

        if (data.time) {
            final_data.duration = data.time;
        }

        if (data.duration) {
            final_data.duration = data.duration;
        }
    
        // get the score
        final_data.score = final_data.is_answered ? score.dice_no : -1; 
    
        let [numberOfAffectedRows, affectedRows] = await Score.update(final_data, {
            where: {id: score_id},
            returning: true, // needed for affectedRows to be populated
            plain: true 
        });

        return affectedRows;
    } catch (ex) {
        throw ex;
    }
}

async function getAvgScore(room_id, round_no, options) {
    try {
        if (!room_id) {
            throw new Error("Please specify room id");
        }

        if (!round_no) {
            throw new Error("Please specify round no");
        }
        
        return Score.findAll({
            attributes: ['user_id', [db.sequelize.fn('AVG',
                db.sequelize.col('duration')), 'avg_duration']],
            group: ['user_id'],
            where: {
                [Op.and]: [{
                    room_id: room_id,
                    round_no: round_no
                }]
            }
        });
    } catch (ex) {
        throw ex;
    }
}

async function isScoreAlreadySubmited(score_id, options) {
    try {
        if (!score_id) {
            throw new Error("Please specify the score_id");
        }
    
        let score = await getScoreById(score_id);
        if (score && score.length > 0) {
            score = score[0];
        }

        if (score.is_answered) {
            return true;
        }
        return false;
    } catch(ex) {
        throw ex;
    }
}

exports.insert = insert;
exports.updateScore = updateScore;
exports.isScoreAlreadySubmited = isScoreAlreadySubmited;
exports.getAvgScore = getAvgScore;