"use strict";
const debug = require("debug");
const log = debug("SocketServer log");
const errorLog = debug("SocketServer Errorlog");
const cn = require("../config/config");
const when = require("when");
const moment = require("moment");

var ROUND_NO = 2;
if (process.env.ROUND_NO) {
    ROUND_NO = process.env.ROUND_NO;
}

var roomController;
var userController;
var scoreController;
var questionController;
var totalMarkController;
var roomCache;

when(cn.init(), function Success() {
    roomController = require("../controller/roomController");
    userController = require("../controller/userController");
    scoreController = require("../controller/scoreController");
    questionController = require("../controller/questionController");
    totalMarkController = require("../controller/totalMarkController");
    roomCache = require("../store/cache/roomCache");
});

exports = module.exports = function (io) {
    io.sockets.on('connection', function (socket) {
        log("connection");

        console.log("A new socket has joined: " + socket.id);

        // socket.on("hello", function(data) {
        //     console.log(data);
        // });
        /*
        * Test message
        */
        // io.sockets.emit('chat message', "Received ur msg");
        // socket.on('chat message', function (msg) {
        //     log("I received the msg");

        // });

        // io.sockets.emit('welcome', { message: 'Welcome bro!'});

        socket.on(`hello`, function (msg) {
            console.log(msg);
            io.sockets.emit('chat message', "Received ur msg");
            io.sockets.emit('welcome', { message: 'Welcome bro!' });
        });
        // socket.on('create', function(room) {
        //     log("Joining socket to room:", room);
        //     socket.join(room);
        //     io.emit('ack_room_joined', "joined the room successfully");
        //     // socket.to('room1').emit('test', 'some event emitted');
        //     io.sockets.in('room1').emit('test', 'some event emitted');
        // });

        /*
        * User details structure
        * {token: 'TOKEN', room_id: ROOM_ID}
        */
        socket.on('join_room', async function (user_details) {
            try {
                if (!user_details.hasOwnProperty('token') || !user_details.token) {
                    io.emit('err_join_room', "Failed to join room because token is not defined");
                    return;
                }

                if (!user_details.hasOwnProperty('room_id') || !user_details.room_id) {
                    io.emit('err_join_room', "Failed to join room because room id is not defined");
                    return;
                }

                user_details.room_id = parseInt(user_details.room_id);

                let user_id = await userController.getUserByToken(user_details.token);

                if (!user_id) {
                    throw new Error("Could not find the user");
                }

                let meta_details = await userController.getUserMetaDetails(user_id, user_details.room_id);

                Object.assign(user_details, meta_details);
                user_details.user_id = user_id;
                log(`user: ${user_details.user_id} of color ${user_details.color} joined room: ${user_details.room_id}`);

                let isFirstTime = await roomCache.getIsFirstTimeInRoom(meta_details.room_id);

                let is_first_time = "false";
                
                if (!isFirstTime) {
                    await roomCache.setIsFirstTimeInRoom(meta_details.room_id, "true");
                    is_first_time = "true";
                } else if (isFirstTime === "true") {
                    is_first_time = "true";
                }

                let totalMarks = await totalMarkController.getTotalMarksByUserIdRoomIdAndRoundNo(user_details.user_id, user_details.room_id, ROUND_NO);

                socket.join(user_details.room_id);
                if (totalMarks) {
                    if (totalMarks.length > 0) {
                        totalMarks = totalMarks[0];
                    }
                    if (totalMarks.is_game_over) {
                        io.emit('err_join_room', "Sorry, the game is over.");
                        return;
                    }
                }

                // if (user_details.color === 'red') {
                //     let red_joining_time = moment().utc();
                //     await roomController.updateRedRoomJoiningTime(user_details.room_id, ROUND_NO, red_joining_time);
                // }

                let is_room_full = await roomController.isRoomFull({ room_id: user_details.room_id });

                io.sockets.in(user_details.room_id).emit('ack_join_room', { status: 200, is_room_full: is_room_full, is_first_time: is_first_time, msg: `User has joined the room with id ${user_details.room_id} successfully.` });
            } catch (ex) {
                io.sockets.in(user_details.room_id).emit('err_join_room', ex);
                throw ex;
            }
        });

        socket.on("block", async function (block_details) {
            try {
                if (!block_details.hasOwnProperty("room_id")) {
                    throw new Error("Please specify room id");
                }
                if (!block_details.hasOwnProperty("is_blocked")) {
                    throw new Error("Please specify is blocked");
                }

                await roomController.updateRoomBlocked(block_details.room_id, ROUND_NO, block_details.is_blocked);
            } catch(ex) {
                throw ex;
            }
        });

        /*
        * Join room if not joined
        * id - room {token: TOKEN, room_id: ROOMID}
        */
        socket.on("join", async function (join_details) {
            try {
                if (!join_details  || !join_details.token) {
                    throw new Error("Please specify the token");
                }
                if (!join_details  || !join_details.room_id) {
                    throw new Error("Please specify the room id");
                }

                join_details.room_id = parseInt(join_details.room_id);
                
                let user_id = await userController.getUserByToken(join_details.token);
    
                if (!user_id) {
                    throw new Error("Could not find the user");
                }
    
                let meta_details = await userController.getUserMetaDetails(user_id, join_details.room_id);

                console.log("user joined room " + meta_details.room_id);
                var roomId = socket.adapter.rooms[meta_details.room_id];
                
                console.log(roomId);

                let res = await totalMarkController.getCurrentScoreOfPlayersInRoom(meta_details.room_id, ROUND_NO);
                // if (roomId != undefined) {
                    
                // }
                socket.join(meta_details.room_id);
                let next_color_turn;
                next_color_turn = await roomCache.getTurnInRoom(meta_details.room_id);
                console.log("Joining room");

                if (!next_color_turn ) {
                    await roomCache.setTurnInRoom(meta_details.room_id, "red");
                    next_color_turn = "red";
                }
                res.next_color_turn = next_color_turn;
                console.log(JSON.stringify(res));

                //note: ack join wont be passed to entire room.
                // io.sockets.in().emit("ack_join", res);
                socket.emit("ack_join", res);
            } catch(ex) {
                socket.emit("err_join", ex);
                throw ex;
            }
        });

        socket.on('show_timer', async function (details) {
            try {
                if (!details) {
                    throw new Error("Please specify the details");
                }

                if (!details.room_id) {
                    throw new Error("Please specify the room id");
                }

                if (details.time === undefined) {
                    throw new Error("Please specify the time");
                }

                details.time = parseInt(details.time);

                io.sockets.in(details.room_id).emit("ack_show_timer", {time: details.time, room_id: details.room_id, color: details.color});
            } catch(ex) {
                socket.emit("err_show_timer", ex);
            }
        });
        // {dice_rolled_by: 'red', token: TOKEN, is_first_time, room_id: ROOMID}
        socket.on('start_game', async function (game_details) {
            try {
                if (!game_details || !game_details.dice_rolled_by) {
                    throw new Error("Please specify dice rolled by");
                }
                if (!game_details.room_id) {
                    throw new Error("Please specify the room id");
                }

                game_details.room_id = parseInt(game_details.room_id);
                
                let user_id = await userController.getUserByToken(game_details.token);
    
                if (!user_id) {
                    throw new Error("Could not find the user");
                }
    
                let meta_details = await userController.getUserMetaDetails(user_id, game_details.room_id);

                //set room id
                //Mark the room with game started field
                await roomController.updateRoom({is_game_started: true}, meta_details.room_id);
                await roomCache.setIsFirstTimeInRoom(meta_details.room_id, "false");
                await roomCache.setTurnInRoom(meta_details.room_id, game_details.dice_rolled_by);

                io.sockets.in(meta_details.room_id).emit("ack_start_game", {turn: game_details.dice_rolled_by, is_game_started: true});
                // io.sockets.in(meta_details.room_id).emit("ack_turn", {turn: "red"});
            } catch (ex) {
                io.sockets.in(meta_details.room_id).emit("err_start_game", ex);
            }
        });

        // {token: TOKEN, color: COLOR, room_id: ROOM_ID}
        socket.on('next_color_turn', async function(current_user_details) {
            try {
                console.log(JSON.stringify(current_user_details));
                if (!current_user_details || !current_user_details.token) {
                    throw new Error("User token not found");
                }

                if (!current_user_details.room_id) {
                    throw new Error("Please specify the room id");
                }
                //TODO: check validations
                let user_id = await userController.getUserByToken(current_user_details.token);

                if (!user_id) {
                    throw new Error("Could not find the user");
                }

                current_user_details.room_id = parseInt(current_user_details.room_id);
                let meta_details = await userController.getUserMetaDetails(user_id, current_user_details.room_id);

                if (meta_details.room_id !== current_user_details.room_id) {
                    io.sockets.in(current_user_details.room_id).emit('err_next_color_turn', "Room ids are not matching!!");
                    return;
                }
                Object.assign(current_user_details, meta_details);
                socket.join(current_user_details.room_id);


                current_user_details.user_id = user_id;
                current_user_details.round_no = ROUND_NO;

                let next_color_turn;
                if (current_user_details.is_left && current_user_details.set_color) {
                    next_color_turn = current_user_details.set_color;
                } else {
                    let color = await roomCache.getTurnInRoom(current_user_details.room_id); 
                    if (!color) {
                        // set red turn in the room
                        color = 'red';
                    } 
                    // if (current_user_details.color !== color) {
                    //     io.sockets.in(current_user_details.room_id).emit('err_next_color_turn', "Your colors are not matching!");
                    //     return;
                    // }
    
                    //get the next turn in the room
                    next_color_turn = await roomController.getNextColorTurn(current_user_details.room_id, color);
                }
                
                if (next_color_turn) {
                    await roomCache.setTurnInRoom(current_user_details.room_id, next_color_turn);
                
                    io.sockets.in(current_user_details.room_id).emit('ack_next_color_turn', {turn: next_color_turn, room_id: current_user_details.room_id});
                    return;
                } else {
                    io.sockets.in(current_user_details.room_id).emit('err_next_color_turn', "Could not find the next color");
                    return;
                }
            } catch (ex) {
                throw ex;
            }
        });

        /*
        * Dice details structure
        * {token: 'TOKEN', dice_no: 1, room_id: ROOMID}
        */
        socket.on('dice_thrown', async function (dice_details) {
            try {
                //TODO: add validation if all fields exist
                if (!dice_details.hasOwnProperty('token') || !dice_details.token) {
                    io.emit('err_dice_thrown', "Failed to throw dice room because token is not defined");
                    return;
                }

                if (!dice_details.hasOwnProperty('dice_no') || !dice_details.dice_no) {
                    io.emit('err_dice_thrown', "Failed to throw dice room because dice no is not defined");
                    return;
                }

                if (dice_details.dice_no < 1 || dice_details.dice_no > 6) {
                    io.emit('err_dice_thrown', "Dice no should be in range 1-6.");
                    return;
                }

                if (!dice_details.room_id) {
                    io.emit('err_dice_thrown', "Please specify the room id");
                    return;
                }
                dice_details.room_id = parseInt(dice_details.room_id);
                let user_id = await userController.getUserByToken(dice_details.token, dice_details.room_id);

                if (!user_id) {
                    throw new Error("Could not find the user");
                }

                let meta_details = await userController.getUserMetaDetails(user_id, dice_details.room_id);

                Object.assign(dice_details, meta_details);
                socket.join(dice_details.room_id);


                dice_details.user_id = user_id;
                dice_details.round_no = ROUND_NO;

                //check if the game is started and then only show questions

                let is_game_started = await roomController.isGameStarted(dice_details.room_id);

                if (!is_game_started) {
                    io.sockets.in(dice_details.room_id).emit('err_dice_thrown', "Game is not started yet for the room.");
                    return;
                }

                let totalMarks = await totalMarkController.getTotalMarksByUserIdRoomIdAndRoundNo(dice_details.user_id, dice_details.room_id, dice_details.round_no);

                let is_stuck = false;
                if (totalMarks && totalMarks.length > 0) {
                    totalMarks = totalMarks[0];
                }

                if (totalMarks && totalMarks.marks) {
                    if ((totalMarks.marks + dice_details.dice_no) > 60) {
                        is_stuck = true;
                        io.sockets.in(dice_details.room_id).emit('ack_dice_thrown', {is_stuck: is_stuck, dice_no: dice_details.dice_no, color: meta_details.color});
                        return;
                    }
                }

                let is_game_over = await totalMarkController.isGameOverInRoom(dice_details.room_id, dice_details.round_no);

                if (is_game_over) {
                    io.sockets.in(dice_details.room_id).emit('err_dice_thrown', 'Sorry, the game is already over!');
                    return;
                }
                //dice details holds user_id, color, round_no, room_id, dice_no
                //1. get the question for that user
                //2. update quiz table with required info
                let result = await questionController.getQuestionForUserIdForRoom(dice_details);

                if (result && result.question_id) {
                    dice_details.question_id = result.question_id;
                }
                let score = await scoreController.insert(dice_details);

                if (score && score.length > 0) {
                    score = score[0];
                }

                if (score && score.id) {
                    result.score_id = score.id;
                }

                result.is_stuck = is_stuck;
                result.dice_no = dice_details.dice_no;
                result.color = meta_details.color;

                io.sockets.in(dice_details.room_id).emit('ack_dice_thrown', result);
                return result;
            } catch (ex) {
                io.sockets.in(dice_details.room_id).emit('err_dice_thrown', ex);
                throw ex;
            }
        });

        /*
        * Answer details structure
        * {token: 'TOKEN', room_id: ROOMID, score_id: 'SCORE_ID', question_id: QUESTION_ID, answer_option_selected: 'option_one', time: TIME_IN_MILLIS}
        */
    socket.on('answer', async function (ans_details) {
            try {
                if (!ans_details.room_id) {
                    throw new Error("Please specify the room id");
                }
                let user_id = await userController.getUserByToken(ans_details.token);
                if (!user_id) {
                    throw new Error("Could not find the user");
                }
                ans_details.room_id = parseInt(ans_details.room_id);

                let meta_details = await userController.getUserMetaDetails(user_id, ans_details.room_id);

                Object.assign(ans_details, meta_details);
                ans_details.user_id = user_id;
                ans_details.round_no = ROUND_NO;

                let is_game_started = await roomController.isGameStarted(ans_details.room_id);

                if (!is_game_started) {
                    io.sockets.in(ans_details.room_id).emit('err_answer', {is_err: true, msg: "Game is not started yet for the room."});
                    return;
                }

                //is game ended

                let color = await roomCache.getTurnInRoom(ans_details.room_id); 
                if (ans_details.color !== color) {
                    // err -> color
                    console.log("----------Incorrect color----------");
                    socket.emit('ack_next_color_turn', {turn: color, msg: "Incorrect color"});
                    // io.sockets.in(ans_details.room_id).emit('ack_next_color_turn', {turn: color, msg: "Incorrect color"});
                    // io.sockets.in(ans_details.room_id).emit('err_answer', {is_err: true, msg: "Incorrect color"});
                    return;
                }

                let is_score_already_submitted = await scoreController.isScoreAlreadySubmited(ans_details.score_id);

                if (is_score_already_submitted) {
                    io.sockets.in(ans_details.room_id).emit('err_answer', {is_err: true, msg: "You have already submitted the answer."});
                    return;
                }

                //get the next turn in the room
                // let next_color_turn = await roomController.getNextColorTurn(ans_details.room_id, ans_details.color);
                socket.join(ans_details.room_id);

                // await roomCache.setTurnInRoom(ans_details.room_id, next_color_turn);

                let previous_total_score = await totalMarkController.getTotalMarksByUserIdRoomIdAndRoundNo(ans_details.user_id, ans_details.room_id, ans_details.round_no);
                let previous_score = 0;
                if (previous_total_score && previous_total_score.length > 0) {
                    previous_total_score = previous_total_score[0];
                }
                if (previous_total_score) {
                    previous_score = previous_total_score.marks;
                }



                //get question by id
                let question_details = await questionController.getQuestionById(ans_details.question_id);

                if (question_details && question_details.length > 0) {
                    question_details = question_details[0];
                }

                let is_answered = false;
                switch (ans_details.answer_option_selected.toLowerCase()) {
                    case 'option_one':
                        is_answered = question_details.answer === `1` ? true : false;
                        break;
                    case 'option_two':
                        is_answered = question_details.answer === `2` ? true : false;
                        break;
                    case 'option_three':
                        is_answered = question_details.answer === `3` ? true : false;
                        break;
                    case 'option_four':
                        is_answered = question_details.answer === `4` ? true : false;
                        break;
                    case 'not_answered':
                        is_answered = false;
                        break;
                    default:
                        errorLog("Inccorect option is selected");
                        throw new Error("Inccorect option is selected");
                }

                ans_details.is_answered = is_answered;
                // update the score if the answer is correct or wrong
                let score_res = await scoreController.updateScore(ans_details.score_id, ans_details);
                if (score_res && score_res.length > 0) {
                    score_res = score_res[0];
                }

                if ((previous_score + score_res.score) > 60) {
                    io.sockets.in(ans_details.room_id).emit('err_answer', {is_err: true, 
                        msg: "This question should not appear as your current score plus previous score is crossing 60"});
                    return;
                }
                let result = {
                    is_answer_correct: score_res.is_answered,
                    current_question_score: score_res.score,
                    room_id: ans_details.room_id,
                    color: ans_details.color,
                    // next_color_turn: next_color_turn,
                    previous_score: previous_score
                };
                //Update the final user score

                let totalMarks = await totalMarkController.updateTotalMarks(ans_details.user_id, ans_details.round_no, ans_details.room_id, ans_details.color, score_res.score);
                if (totalMarks && totalMarks.length > 0) {
                    totalMarks = totalMarks[0];
                }

                // if the score reaches to 60 for one player check it should reach to 60 for other players and further events disabled
                if (totalMarks.marks === 60 || totalMarks.is_game_over) {
                    await totalMarkController.updateGameOverInRoom(ans_details.user_id, ans_details.room_id, ROUND_NO);
                }
                result.current_score = totalMarks.marks;

                io.sockets.in(ans_details.room_id).emit('ack_answer', result);
            } catch (ex) {
                // here emit err event
                io.sockets.in(ans_details.room_id).emit('err_answer', {is_err: true, msg: ex});
                throw ex;
            }

        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}