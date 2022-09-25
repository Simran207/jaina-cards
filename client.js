var socket = require('socket.io-client')('http://localhost:8005');
socket.on('connect', function(){
    console.log("Connection successful");
});

socket.on('disconnect', function(){
    console.log("disconnected succesfully");
});

// socket.emit('create', {
//     question: "abc",
//     ans: "123",
//     option: "hdhsgfh"
// });

// socket.emit("dice_thrown", {
//     player: "1", 
//     dice_no: 1,
//     room_id: "room1"
// });

// sleep(5000);
// socket.on("test", function(msg) {
//     console.log("-----------------Receving the message---------------");
//     console.log(msg);
// });

// join room
socket.emit("join_room", {
    token: "8UzbHCvLrFkxh7f2WYpjY5s1QuSw20CgnkgDwZaGiLua0mPxoCyUC_dez_MK57cz"
});

// Successfully joined the room
// ack_msg structure - {is_first_time: FALSE, status: 200, is_room_full: true, msg: MSG}
socket.on('ack_join_room', function(ack_msg) {
    console.log("room joined");
    console.log(ack_msg.status);
    console.log(JSON.stringify(ack_msg));
});

// failed to join the room
// err_ack_msg structure - Plain msg string
socket.on('err_join_room', function(err_ack_msg) {
    console.log("Failed to join the room.");
    console.log(JSON.stringify(err_ack_msg));
});

// join room
// data - passing room id
socket.emit("join", 3);

// Successfully joined the room
// ack_msg structure - {next_color_turn: COLOR, red_current_score: 0, blue_current_score: 0, yellow_current_score: 0, green_current_score: 0} 
socket.on('ack_join', function(ack_msg) {
    console.log("joined");
    console.log(".....................");
    console.log(ack_msg);
});

//ack_msg: string
socket.on('err_join', function(ack_msg) {
    console.log("error in joining");
    console.log(".....................");
    console.log(ack_msg);
});

// Successfully joined the room
// start_game structure - {dice_rolled_by: "red", token: TOKEN}
socket.emit('start_game', {dice_rolled_by: "red",
    token: "8UzbHCvLrFkxh7f2WYpjY5s1QuSw20CgnkgDwZaGiLua0mPxoCyUC_dez_MK57cz"
});

// Successfully started the game
// ack_start_game structure - {turn: red}
socket.on('ack_start_game', function(ack_msg) {
    console.log("game started");
    console.log(ack_msg.turn);
    console.log(JSON.stringify(ack_msg));
});

// failed to start the game
// err_ack_msg structure - Plain msg string
socket.on('err_start_game', function(err_ack_msg) {
    console.log("Failed to start the game.");
    console.log(JSON.stringify(err_ack_msg));
});

// Successfully joined the room
// start_game structure - {color: "red", token: TOKEN}
// socket.emit('next_color_turn', {color: "red",
//     token: "8UzbHCvLrFkxh7f2WYpjY5s1QuSw20CgnkgDwZaGiLua0mPxoCyUC_dez_MK57cz"
// });

// Successfully got the color
// ack_start_game structure - {turn: red}
socket.on('ack_next_color_turn', function(ack_msg) {
    console.log("game started");
    console.log(ack_msg.turn);
    console.log(JSON.stringify(ack_msg));
});

// failed to get the next color
// err_ack_msg structure - Plain msg string
socket.on('err_next_color_turn', function(err_ack_msg) {
    console.log("Failed to get the next color.");
    console.log(JSON.stringify(err_ack_msg));
});

// failed to join the room
// err_ack_msg structure - Plain msg string
socket.on('err_join_room', function(err_ack_msg) {
    console.log("Failed to join the room.");
    console.log(JSON.stringify(err_ack_msg));
});

// Dice throw
socket.emit("dice_thrown", {
    token: "8UzbHCvLrFkxh7f2WYpjY5s1QuSw20CgnkgDwZaGiLua0mPxoCyUC_dez_MK57cz", 
    dice_no: 6
});

// Successfully joined the room
// ack_msg structure - {is_stuck: true, "question_id":35,"question":"भ.महावीर अनार्य देश में कितनी बार गए?","option_one":"4","option_two":"1","option_three":"2","score_id":"Wa8oicB4"}
socket.on('ack_dice_thrown', function(ack_msg) {
    console.log("dice thrown response ");
    console.log(JSON.stringify(ack_msg));
});

// failed to join the room
// err_ack_msg structure - Plain msg string
socket.on('err_dice_thrown', function(err_ack_msg) {
    console.log("Dice thrown response failed");
    console.log(JSON.stringify(err_ack_msg));
})

// Submit answer
// {token: 'TOKEN', score_id: 'SCORE_ID', question_id: QUESTION_ID, answer_option_selected: 'option_one'}
// note: answer_option_selected should be "not_answered" for users who dont submit the answer
// socket.emit("answer", {
//     token: "8UzbHCvLrFkxh7f2WYpjY5s1QuSw20CgnkgDwZaGiLua0mPxoCyUC_dez_MK57cz", 
//     dice_no: 6,
//     score_id: "7rBbSWhb",
//     question_id: 76,
//     answer_option_selected: "option_three"
// });

// Successfully submitted the answer
// ack_msg structure - {"is_answer_correct":true,"current_question_score":1,"current_score":2, next_color_turn: COLOR, previous_score: 66}
socket.on('ack_answer', function(ack_msg) {
    console.log("answer submitted response ");
    console.log(JSON.stringify(ack_msg));
});

// failed to submit the answer
// err_ack_msg structure - {is_err: true, msg: MSG}
socket.on('err_answer', function(err_ack_msg) {
    console.log("answer submitted response failed");
    console.log(JSON.stringify(err_ack_msg));
});