"use strict";

let Users = require("../model/user");
const db = require("../config/config").db;
const { Op } = require("sequelize");
const randomstring = require("randomstring");
const utils = require("../utils/common");
const userCache = require("./cache/userCache");
const roomCache = require("./cache/roomCache"); 
const totalMarksStore = require("./totalMarksStore");
const moment = require("moment");

var roomStore;
const _ = require("lodash");

var ROUND_NO = 2;
if (process.env.ROUND_NO) {
    ROUND_NO = process.env.ROUND_NO;
}

async function insert(data) {
    try {
        const id = randomstring.generate({
            length: 6,
            charset: 'alphanumeric'
        });
        console.log(id);
        // await db.sequelize.sync({force:true});
        let final_data = {
            id: id,
            name: data.name,
            email: data.email,
            contact_no: data.contact_no,
            dob: data.dob,
            city: data.city,
            state: data.state,
            is_eligible: data.is_eligible
        };
        let user = await Users.create(final_data);
        return user;
    } catch(ex) {
        // console.log(JSON.stringify(ex));
        throw ex;
    }
}

async function login(data, options= {}) {
    try {
        let user = await findAll(data);

        console.log(user);
        if (!user || user.length === 0) {
            throw new Error("Please verify your contact no and date of birth");
        }

        user = user[0];

        let todayDate = new Date().getFullYear();

        let userYear = user.dob.getFullYear();

        let diff = todayDate - userYear;

        // let time3 = new Date(2021, 01, 9, 15, 0, 0, 0).getTime();
        // let time4 = new Date(2021, 01, 9, 16, 0, 0, 0).getTime();
        // let time6 = new Date(2021, 01, 9, 18, 0, 0, 0).getTime();
        // let time7 = new Date(2021, 01, 9, 19, 0, 0, 0).getTime();
        // let now = new Date();

        // if(now.getTime() < time3) {
        //     throw new Error("Kindly wait. Game shall start at 3PM");
        // } else if(now.getTime() >= time3 && now.getTime() <= time4 && diff < 25) {
        //     /* do stuff */
        //     throw new Error("Currently the game is ongoing for users with age greater than 25.")
        // } else if(now.getTime() > time4 && now.getTime() > time6) {
        //     throw new Error("Kindly wait. Game shall start at 6PM");
        // } 
        // else if (now.getTime() >= time6 && now.getTime() <= time7 && diff > 25) {
        //     throw new Error("Currently the game is ongoing for users with age less than 25.");
        // }

        if (diff > 25) {
            throw new Error("Currently the game is ongoing for users with age lesser than 25.");
        }

        if (!user.is_eligible) {
            throw new Error("You are not eligible to play this game");
        }

        let login_time = await userCache.getUserLoginTime(user.id, ROUND_NO);
        if (login_time) {
            login_time = parseInt(login_time);

            if (login_time >= 3) {
                throw new Error("Sorry, you wont be able to login now");
            } else {
                login_time += 1;
            }
        } else {
            login_time = 1;
        }

        await userCache.setUserLoginTime(user.id, ROUND_NO, login_time);

        // disable login if the game is already over for a user
        let totalMarks = await totalMarksStore.getTotalMarksByUserIdAndRoundNo(user.id, ROUND_NO);
        

        if (totalMarks && totalMarks.length > 0) {
            // totalMarks = totalMarks[0];
            for (let i = 0; i < totalMarks.length; i++) {
                if (totalMarks[i] && totalMarks[i].is_game_over) {
                    throw new Error("You have already played the game. We shall announce the results on 20th Jan 2021.")
                }
            }
        }

        let token = await utils.generateToken();

        console.log(token);
        await userCache.setUserToken(token, user.id);
        let result = {
            token: token
        };
        return result;
    } catch (ex) {
        throw ex;
    }
}

function findAll(options) {
    try {
        return Users.findAll({
            where: {
                [Op.and]: [options]
            }
        });
    } catch(ex) {
        throw ex;
    }
}

function findByIds(user_ids) {
    try {
        if (!user_ids || user_ids.length === 0) {
            throw new Error("Could not find user ids");
        }
        return Users.findAll({
            where: {
                id: {
                    [Op.in]: user_ids
                }
            }
        });
    } catch(ex) {
        throw ex;
    }
}

async function joinToRoom(token, options = {}) {
    try {
        if (!roomStore) {
            roomStore = require("./roomStore");
        }
        let user_id = await userCache.getUserToken(token);

        if(!user_id) {
            throw new Error("Could not find user id details");
        }

        let user = await findByIds([user_id]);

        if (user && user.length > 0) {
            user = user[0];
        }

        let last_created_room = await roomCache.getLatestRoom();

        let assign_room_id;

        let assign_color;

        let create_new_room = true;
        let get_room;
        let is_game_started = false;

        // check if the user is already joined to some room
        let isPresent = await roomStore.isUserAlreadyPresentInRoom(user_id);

        if (isPresent) {
            throw new Error("You have already joined to another room.");
        }

        if (last_created_room) {
            last_created_room = parseInt(last_created_room);
            get_room = await roomStore.findRoomById({room_id: last_created_room});

            if (!get_room || !get_room.id) {
                throw new Error("Incorrect room id");
            }

            if (get_room.is_game_started) {
                create_new_room = true;
                is_game_started = true;
                // break;
            }

            if (get_room.is_blocked) {
                create_new_room = true;
            }

            // if (get_room.red_joining_time) {
            //     let current = moment().utc();
            //     let updateTime = moment(get_room.red_joining_time).add(2, 'minutes');

            //     if (!current.isBefore(updateTime)) {
            //         create_new_room = true;
            //     }
            // }
        }
        if (last_created_room && !is_game_started && !get_room.is_blocked) {
            if (get_room.red_user_id === user_id) {
                assign_color = 'red';
                return {
                    color: assign_color,
                    room_id: get_room.id,
                    name: user.name
                };
            } else if (get_room.blue_user_id === user_id) {
                assign_color = 'blue';
                return {
                    color: assign_color,
                    room_id: get_room.id,
                    name: user.name
                };
            } else if (get_room.yellow_user_id === user_id) {
                assign_color = 'yellow';
                return {
                    color: assign_color,
                    room_id: get_room.id,
                    name: user.name
                };
            } else if (get_room.green_user_id === user_id) {
                assign_color = 'green';
                return {
                    color: assign_color,
                    room_id: get_room.id,
                    name: user.name
                };
            }
            
            assign_room_id = get_room.id;

            if (!_.get(get_room, "red_user_id")) {
                get_room.red_user_id = user_id;
                assign_color = 'red';
                create_new_room = false;
            } else if (!_.get(get_room, "green_user_id")) {
                get_room.green_user_id = user_id;
                assign_color = 'green';
                create_new_room = false;
            } else if (!_.get(get_room, "yellow_user_id")) {
                get_room.yellow_user_id = user_id;
                assign_color = 'yellow';
                create_new_room = false;
            } else if (!_.get(get_room, "blue_user_id")) {
                get_room.blue_user_id = user_id;
                assign_color = 'blue';
                create_new_room = false;
            }
        }

        if (create_new_room) {
            // create new room
            let data = {red_user_id: user_id};
            assign_color = 'red';
            let new_room = await roomStore.insert(data);

            console.log(JSON.stringify(new_room));
            if(!new_room || !new_room.id) {
                throw new Error("Failed to create room");
            }
            
            assign_room_id = new_room.id;
            await roomCache.setLatestRoom(assign_room_id);
        } else {
            await roomStore.updateRoom(get_room, assign_room_id);
        }
        let result = {
            color: assign_color,
            room_id: assign_room_id,
            name: user.name,
            round_no: ROUND_NO
        };
        // Store details in cache
        await userCache.setUserMetaDetails(user_id, assign_room_id, result);
        return result;
    } catch(ex) {
        throw ex;
    }
}

async function getUserByToken(token, options={}) {
    try {
        console.log("get token details");
        console.log(token);
        
        let user_id = await userCache.getUserToken(token);

        if(!user_id) {
            throw new Error("Could not find user id details");
        }

        return user_id;
    } catch (ex) {
        throw ex;
    }
}

async function getUserMetaDetails(user_id, room_id, options={}) {
    try {
        let user_meta_details = await userCache.getUserMetaDetails(user_id, room_id);
        if (!user_meta_details) {
            throw new Error("Failed to find the user meta details");
        }
        user_meta_details = JSON.parse(user_meta_details);
        return user_meta_details;
    } catch (ex) {
        throw ex;
    }
}

async function logout(token, options = {}) {
    try {
        userCache.deleteUserToken(token);
    } catch (ex) {
        throw ex;
    }
}

async function readAndUpdateUsers(contact_no, dob, is_eligible) {
    try {
        if (!contact_no) {
            throw new Error("Please specify the contact no");
        }
        if (!dob) {
            throw new Error("Please specify the dob");
        }
        let data = {};

        data.is_eligible = is_eligible ? true : null;
        let [numberOfAffectedRows, affectedRows] = await Users.update(data, {
            where: {contact_no: contact_no, dob: dob},
            returning: true, // needed for affectedRows to be populated
            plain: true 
        });

        return affectedRows;
    } catch (ex) {
        throw ex;
    }
}

exports.insert = insert;
exports.login = login;
exports.findAll = findAll;
exports.joinToRoom = joinToRoom;
exports.getUserByToken = getUserByToken;
exports.getUserMetaDetails = getUserMetaDetails;
exports.logout = logout;
exports.findByIds = findByIds;
exports.readAndUpdateUsers = readAndUpdateUsers;