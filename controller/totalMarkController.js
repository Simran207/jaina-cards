"use strict";
let totalMarksStore = require("../store/totalMarksStore");
let roomController = require("../controller/roomController");
let userController = require("../controller/userController");

const _ = require("lodash");

async function updateTotalMarks(user_id, round_no, room_id, color, marks_to_be_updated, options={}) {
    return await totalMarksStore.updateTotalMarks(user_id, round_no, room_id, color, marks_to_be_updated, options);
}

async function getTotalMarksByUserIdAndRoundNo(user_id, round_no, options) {
    return await totalMarksStore.getTotalMarksByUserIdAndRoundNo(user_id, round_no, options);
}

async function getTotalMarksByUserIdRoomIdAndRoundNo(user_id, room_id, round_no, options) {
    return await totalMarksStore.getTotalMarksByUserIdRoomIdAndRoundNo(user_id, room_id, round_no, options);
}

async function isGameOverInRoom(room_id, round_no, options) {
    return await totalMarksStore.isGameOverInRoom(room_id, round_no, options);
}

async function getScoreboardInRoom(room_id, round_no, options = {}) {
    try {
        let totalMarks = await totalMarksStore.getTotalMarksInRoom(room_id, round_no, options);

        let final_result_in_room = [];
        if (totalMarks && totalMarks.length > 0) {
            let user_ids = [];
            for (let i = 0; i < totalMarks.length; i++) {
                user_ids.push(totalMarks[i].user_id);
            }

            // get users from user_ids
            let  users = await userController.findByIds(user_ids);

            let room = await roomController.findRoomById({room_id: room_id});

            totalMarks.sort((a, b) => (a.marks < b.marks) ? 1 : -1);
            for (let i = 0; i < totalMarks.length; i++) {
                // get users in the room

                let res = {};
                res.marks = totalMarks[i].marks;
                res.avg_time_taken = totalMarks[i].avg_time_taken;
                res.rank = (i + 1);
                if (totalMarks[i].user_id === room.red_user_id) {
                    res.color = 'red';
                } else if (totalMarks[i].user_id === room.blue_user_id) {
                    res.color = 'blue';
                } else if (totalMarks[i].user_id === room.yellow_user_id) {
                    res.color = 'yellow';
                } else if (totalMarks[i].user_id === room.green_user_id) {
                    res.color = 'green';
                }

                let user = _.filter(users, u => {
                    return (u.id === totalMarks[i].user_id);
                });
                if (user && user.length > 0) {
                    user = user[0];
                }
                res.name = user.name;
                final_result_in_room.push(res);
            }
            return final_result_in_room;
        }
    } catch (ex) {
        throw ex;
    }
}

async function getCurrentScoreOfPlayersInRoom(room_id, round_no, options = {}) {
    try {
        let totalMarks = await totalMarksStore.getTotalMarksInRoom(room_id, round_no, options);

        let room = await roomController.findRoomById({room_id: room_id});

        let res = {
            red_current_score: 0,
            green_current_score: 0,
            blue_current_score: 0,
            yellow_current_score: 0
        };
        if (totalMarks && totalMarks.length > 0) {
            for (let i = 0; i < totalMarks.length; i++) {
                if (totalMarks[i].user_id === room.red_user_id) {
                    res.red_current_score = totalMarks[i].marks;
                } else if (totalMarks[i].user_id === room.green_user_id) {
                    res.green_current_score = totalMarks[i].marks;
                } else if (totalMarks[i].user_id === room.blue_user_id) {
                    res.blue_current_score = totalMarks[i].marks;
                } else if (totalMarks[i].user_id === room.yellow_user_id) {
                    res.yellow_current_score = totalMarks[i].marks;
                }
            }
        }

        return res;
    } catch (ex) {
        throw ex;
    }
}

async function updateGameOverInRoom(winner_user_id, room_id, round_no, options = {}) {
    return await totalMarksStore.updateGameOverInRoom(winner_user_id, room_id, round_no, options);
}

exports.updateTotalMarks = updateTotalMarks;
exports.getTotalMarksByUserIdAndRoundNo = getTotalMarksByUserIdAndRoundNo;
exports.isGameOverInRoom = isGameOverInRoom;
exports.getScoreboardInRoom = getScoreboardInRoom;
exports.getCurrentScoreOfPlayersInRoom = getCurrentScoreOfPlayersInRoom;
exports.updateGameOverInRoom = updateGameOverInRoom;
exports.getTotalMarksByUserIdRoomIdAndRoundNo = getTotalMarksByUserIdRoomIdAndRoundNo;