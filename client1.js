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
    token: "aIDBQ2J0joXFrH5uiLS2fTM4n5_oi_YrVDKUmpSR6-9iXvu9QrUM2ZAZaRHxnaLJ"
});

// Successfully joined the room
// ack_msg structure - {status: 200, msg: MSG}
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
})

// Dice throw
// socket.emit("dice_thrown", {
//     token: "aIDBQ2J0joXFrH5uiLS2fTM4n5_oi_YrVDKUmpSR6-9iXvu9QrUM2ZAZaRHxnaLJ", 
//     dice_no: 1
// });

// Successfully joined the room
// ack_msg structure - {"question_id":35,"question":"भ.महावीर अनार्य देश में कितनी बार गए?","option_one":"4","option_two":"1","option_three":"2","score_id":"Wa8oicB4"}
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
//     token: "aIDBQ2J0joXFrH5uiLS2fTM4n5_oi_YrVDKUmpSR6-9iXvu9QrUM2ZAZaRHxnaLJ", 
//     dice_no: 1,
//     score_id: "xQ2EYyCR",
//     question_id: 62,
//     answer_option_selected: "option_four"
// });

// Successfully submitted the answer
// ack_msg structure - {"is_answer_correct":true,"current_question_score":1,"current_score":2}
socket.on('ack_answer', function(ack_msg) {
    console.log("answer submitted response ");
    console.log(JSON.stringify(ack_msg));
});

// failed to submit the answer
// err_ack_msg structure - Plain msg string
socket.on('err_answer', function(err_ack_msg) {
    console.log("answer submitted response failed");
    console.log(JSON.stringify(err_ack_msg));
})