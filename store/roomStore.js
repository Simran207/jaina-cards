"use strict";

let Room = require("../model/room");
const db = require("../config/config").db;
const { Op } = require("sequelize");


async function insert(data, options = {}) {
    try {
        let final_data = {};
        if (data.red_user_id) {
            final_data.red_user_id = data.red_user_id;
        }
        if (data.blue_user_id) {
            final_data.blue_user_id = data.blue_user_id;
        }
        if (data.yellow_user_id) {
            final_data.yellow_user_id = data.yellow_user_id;
        }
        if (data.green_user_id) {
            final_data.green_user_id = data.green_user_id;
        }
        final_data.is_game_started = false;
        final_data.is_blocked = false;

        // await db.sequelize.sync({force: true});
        let new_room = await Room.create(final_data);
        return new_room;
    } catch(ex) {
        throw ex;
    }
}

async function updateRedRoomJoiningTime(room_id, round_no, red_joining_time, options) {
    try {
        if (!red_joining_time) {
            throw new Error("Please mention red joining time");
        }

        if (!room_id) {
            throw new Error("Please specify the room id");
        }

        if (!round_no) {
            throw new Error("Please specify the round no");
        }

        let final_data = {
            red_joining_time: red_joining_time
        };

        let [numberOfAffectedRows, affectedRows] = await Room.update(final_data, {
            where: { id: room_id },
            returning: true, // needed for affectedRows to be populated
            plain: true
        });

        return affectedRows;
    } catch (ex) {
        throw ex;
    }
}

async function updateRoomBlocked(room_id, round_no, is_blocked, options) {
    try {

        if (!room_id) {
            throw new Error("Please specify the room id");
        }

        if (!round_no) {
            throw new Error("Please specify the round no");
        }

        let final_data = {
            is_blocked: is_blocked
        };

        let [numberOfAffectedRows, affectedRows] = await Room.update(final_data, {
            where: { id: room_id },
            returning: true, // needed for affectedRows to be populated
            plain: true
        });

        return affectedRows;
    } catch (ex) {
        throw ex;
    }
}

async function updateRoom(data, room_id, options) {
    try {
        let final_data = {};
        if (data.red_user_id) {
            final_data.red_user_id = data.red_user_id;
        }
        if (data.blue_user_id) {
            final_data.blue_user_id = data.blue_user_id;
        }
        if (data.yellow_user_id) {
            final_data.yellow_user_id = data.yellow_user_id;
        }
        if (data.green_user_id) {
            final_data.green_user_id = data.green_user_id;
        }

        if (data.is_game_started) {
            final_data.is_game_started = data.is_game_started;
        }

        let [numberOfAffectedRows, affectedRows] = await Room.update(final_data, {
            where: { id: room_id },
            returning: true, // needed for affectedRows to be populated
            plain: true
        });

        return affectedRows;
    } catch (ex) {
        throw ex;
    }
}

function findRoomById(options) {
    try {
        if (!options.room_id) {
            throw new Error("Please specify room id");
        }
        return Room.findOne({
            where: {
                [Op.and]: [{
                    id: options.room_id
                }]
            }
        });
    } catch (ex) {
        throw ex;
    }
}

async function isUserAlreadyPresentInRoom(user_id, options={}) {
    try {
        if (!user_id) {
            throw new Error("Please specify user id");
        }

        //below code considers it as and checkd it
        let room = await Room.findAll({
            where: {
                [Op.or]: [{
                    red_user_id: user_id,
                    blue_user_id: user_id,
                    yellow_user_id: user_id,
                    green_user_id: user_id
                }]
            }
        });

        let isPresent = true;
        console.log(JSON.stringify(room));
        if (!room) {
            isPresent = false;
        }

        if (room && room.length === 0) {
            isPresent = false;
        } else if (room && room.length > 0) {
            isPresent = true;
        }
        return isPresent;
    } catch (ex) {
        throw ex;
    }
}

async function getNextColorTurn(room_id, color, options) {
    try {
        let room = await findRoomById({room_id: room_id});
        
        if (room) {
            if (color === 'red') {
                if (room.green_user_id) {
                    return 'green';
                }
                return 'red';
            } else if (color === 'green') {
                if (room.yellow_user_id) {
                    return 'yellow';
                }
                return 'red';
            } else if (color === 'yellow') {
                if (room.blue_user_id) {
                    return 'blue';
                }
                return 'red';
            } else if (color === 'blue') {
                if (room.red_user_id) {
                    return 'red';
                }
                throw new Error("Wrong color assignment");
            } 
        } else {
            throw new Error("Your room does not exist");
        }
    } catch (ex) {
        throw ex;
    }
}

exports.insert = insert;
exports.findRoomById = findRoomById;
exports.updateRoom = updateRoom;
exports.getNextColorTurn = getNextColorTurn;
exports.isUserAlreadyPresentInRoom = isUserAlreadyPresentInRoom;
exports.updateRedRoomJoiningTime = updateRedRoomJoiningTime;
exports.updateRoomBlocked = updateRoomBlocked;