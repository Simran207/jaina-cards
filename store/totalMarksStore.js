'use strict';

let TotalMarks = require("../model/totalMarks");
const db = require("../config/config").db;
const { Op } = require("sequelize");
const debug = require("debug"); 
const log = debug("totalMarksStore:");
const scoreController = require("../controller/scoreController");

function getTotalMarksByUserIdAndRoundNo(user_id, round_no, options) {
    try {
        if (!user_id) {
            throw new Error("Please specify user id");
        }
        if (!round_no) {
            throw new Error("Please specify round no");
        }
        return TotalMarks.findAll({
            where: {
                [Op.and]: [{
                    user_id: user_id,
                    round_no: round_no
                }]
            }
        });
    } catch (ex) {
        throw ex;
    }
}

function getTotalMarksByUserIdRoomIdAndRoundNo(user_id, room_id, round_no, options) {
    try {
        if (!user_id) {
            throw new Error("Please specify user id");
        }
        if (!round_no) {
            throw new Error("Please specify round no");
        }
        if (!room_id) {
            throw new Error("Please specify room id");
        }
        return TotalMarks.findOne({
            where: {
                [Op.and]: [{
                    user_id: user_id,
                    round_no: round_no,
                    room_id: room_id
                }]
            }
        });
    } catch (ex) {
        throw ex;
    }
}

async function isGameOverInRoom(room_id, round_no, options) {
    try {
        if (!room_id) {
            throw new Error("Please specify room id");
        }
        if (!round_no) {
            throw new Error("Please specify round no");
        }
        let totalMarks = await TotalMarks.findAll({
            where: {
                [Op.and]: [{
                    room_id: room_id,
                    round_no: round_no
                }]
            }
        });
    
        let is_game_over = false;
    
        if (totalMarks && totalMarks.length > 0) {
            for (let i = 0; i < totalMarks.length; i++) {
                if (totalMarks[i] && totalMarks[i].is_game_over) {
                    return true;
                }
            }
        }
    
        return is_game_over;
    } catch(ex) {
        throw ex;
    }
}

async function updateTotalMarks(user_id, round_no, room_id, color, marks_to_be_updated, options={}) {
    try {
        if (!user_id || !round_no || !room_id || !color || !marks_to_be_updated) {
            throw new Error("please specify the mandatory details");
        } 
        let totalMarks = await getTotalMarksByUserIdRoomIdAndRoundNo(user_id, room_id, round_no);
        let is_insert = false;
        if (!totalMarks) {
            is_insert = true;
        }

        if (totalMarks && totalMarks.length > 0) {
            totalMarks = totalMarks[0];
        }

        let data = {
            user_id: user_id,
            round_no: round_no,
            room_id: room_id,
            color: color
        };

        if (is_insert) {
            data.marks = 0;
        } else {
            data.marks = totalMarks.marks;
        }

        if ((data.marks + marks_to_be_updated) > 60) {
            log("Crossing the marks range");

            throw new Error("The game is over");
        }
        data.marks += marks_to_be_updated;

        // The score wont go in negative, just check if it turns out to be negative rectify it
        if (data.marks < 0) {
            data.marks = 0;
        }

        // update bonus points for star positions
        if (color === 'red' && (data.marks === 6 || data.marks === 47)) {
            data.marks += 2;
        } else if (color === 'green' && (data.marks === 18 || data.marks === 44)) {
            data.marks += 2;
        } else if (color === 'yellow' && (data.marks === 16 || data.marks === 53)) {
            data.marks += 2;
        } else if (color === 'blue' && (data.marks === 26 || data.marks === 55)) {
            data.marks += 2;
        } 

        if (data.marks === 60) {
            data.winner_user_id = user_id;
            data.is_game_over = true;

            //update the above two fields for the rest of players in the room
        } else {
            data.is_game_over = false;
        }

        if (is_insert) {
            let res = await TotalMarks.create(data);
            return res;
        } else {
            console.log("data:");
            console.log(JSON.stringify(data));
            console.log("user_id:", user_id);
            console.log("room_id:", room_id);
            console.log("round_no", round_no);
            let [numberOfAffectedRows, affectedRows] = await TotalMarks.update(data, {
                where: {user_id: user_id, room_id: room_id, round_no: round_no},
                returning: true, // needed for affectedRows to be populated
                plain: true 
            });

            // let query = `select * from questions`;
            // // if (questionList.length > 0) {
            // //     query += ` where id NOT IN (${questionList})`;
            // // }

            // query += ` where user_id='${user_id} and room_id=${room_id} and round_no=${round_no}'`;
            // query += ` ORDER BY random() limit 1`;
            // return await db.sequelize.query(query, {model: TotalMarks});
            return affectedRows;
        }
    } catch(ex) {
        throw ex;
    }
}

async function updateGameOverInRoom(winner_user_id, room_id, round_no, options = {}) {
    try {
        if (!room_id || !round_no) {
            throw new Error("Please specify the details for updating game over");
        }

        

        let scores = await scoreController.getAvgScore(room_id, round_no);

        if (scores && scores.length > 0) {
            let prs = [];
            for (let i = 0; i < scores.length; i++) {
                if (scores[i] && scores[i].dataValues && scores[i].dataValues.user_id) {
                    let data = {
                        winner_user_id: winner_user_id,
                        is_game_over: true,
                        avg_time_taken: parseFloat(scores[i].dataValues.avg_duration)
                    };
                    let pr = TotalMarks.update(data, {
                        where: {room_id: room_id, round_no: round_no, user_id: scores[i].dataValues.user_id},
                        returning: true, // needed for affectedRows to be populated
                        plain: true 
                    });
                    prs.push(pr);
                }
            }

            return await Promise.all(prs);
        }
    } catch (ex) {
        throw ex;
    }
}

async function getTotalMarksInRoom(room_id, round_no, options = {}) {
    try {
        let totalMarks = await TotalMarks.findAll({
            where: {
                [Op.and]: [{
                    room_id: room_id,
                    round_no: round_no
                }]
            }
        });
        return totalMarks;
    } catch (ex) {
        throw ex;
    }
}

exports.updateTotalMarks = updateTotalMarks;
exports.getTotalMarksByUserIdAndRoundNo = getTotalMarksByUserIdAndRoundNo;
exports.isGameOverInRoom = isGameOverInRoom;
exports.getTotalMarksInRoom = getTotalMarksInRoom;
exports.updateGameOverInRoom = updateGameOverInRoom;
exports.getTotalMarksByUserIdRoomIdAndRoundNo = getTotalMarksByUserIdRoomIdAndRoundNo;
