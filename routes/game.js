"use strict";

const _ = require("lodash");
const debug = require("debug");
const log = debug("Game log");
const errorLog = debug("Game error");
const sendfile = require('koa-sendfile');
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const totalMarkController = require("../controller/totalMarkController");
const fs = require("fs");

var ROUND_NO = 2;
if (process.env.ROUND_NO) {
    ROUND_NO = process.env.ROUND_NO;
}

function routes(router) {
    router.get("/test", healthCheck);
    router.get("/updatescoretest", updateScoreTest);
    router.get("/socket", socketioTest);
    router.get("/questions", findQuestions);
    router.post("/login", login);
    router.post("/logout", logout);
    router.get("/join/room", joinToRoom);
    router.get('/', sendHtml);
    router.get("/scoreboard", getScoreBoard);
    return router;
}

// app.get('/', function(req, res){
//     res.sendFile(__dirname + '/index.html');
//   });

async function sendHtml(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./test.html');
}
async function socketioTest(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    const stats = await sendfile(ctx, '/home/komal/Documents/work/personal/jaina_cards/index.html')
    if (!ctx.status) ctx.throw(404)
}

async function healthCheck(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        // await questionController.insert();
        response.result = {
            message: "Successfully connected"
        };
        response.status = { code: 200 };
        // ctx.
        // send('/index.html');
        // await send(ctx, `/index.html`, {
        //     root
        // });
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

async function updateScoreTest(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        // await questionController.insert();
        await totalMarkController.updateGameOverInRoom("NfemWW", 17, 1);
        response.result = {
            message: "Successfully connected"
        };
        response.status = { code: 200 };
        // ctx.
        // send('/index.html');
        // await send(ctx, `/index.html`, {
        //     root
        // });
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

async function findQuestions(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        let questions = await questionController.findAll();
        response.result = {
            questions: questions
        };
        response.status = { code: 200 };
        // ctx.
        // send('/index.html');
        // await send(ctx, `/index.html`, {
        //     root
        // });
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

async function login(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        let body = ctx.request.body;
        let res = await userController.login(body);
        response.result = res;
        response.status = { code: 200 };
        // ctx.
        // send('/index.html');
        // await send(ctx, `/index.html`, {
        //     root
        // });
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

async function logout(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        let query_params = ctx.request.query;

        if (query_params && !query_params.token) {
            throw new Error("Please provide token");
        }

        let token = query_params.token;

        let res = await userController.logout(token);
        response.result = res;
        response.status = { code: 200 };
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

async function joinToRoom(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        let query_params = ctx.request.query;

        if (query_params && !query_params.token) {
            throw new Error("Please provide token");
        }

        let token = query_params.token;

        //Validate cache
        let res = await userController.joinToRoom(token);
        response.result = res;
        response.status = { code: 200 };
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

async function getScoreBoard(ctx, next) {
    ctx.set('Access-Control-Allow-Origin', '*');
    let response = {};
    try {
        let query_params = ctx.request.query;

        if (query_params && !query_params.token) {
            throw new Error("Please provide token");
        }

        if (query_params && !query_params.room_id) {
            throw new Error("Please provide room id");
        }

        let token = query_params.token;

        let room_id = parseInt(query_params.room_id);

        //Validate cache
        let user_id = await userController.getUserByToken(token);
        // joinToRoom(token);

        if (!user_id) {
            throw new Error("Sorry could not find the token. Please try again");
        }

        let meta_details = await userController.getUserMetaDetails(user_id, room_id);

        let res = await totalMarkController.getScoreboardInRoom(meta_details.room_id, ROUND_NO);
        response.result = res;
        // let res = {};
        response.status = { code: 200 };
        ctx.body = response;
    }
    catch (ex) {
        errorLog(ex);
        response.status = {code: 400};
        let message;
        if (ex.toString().startsWith("Error: ")) {
            message = ex.toString().slice(7);
        } else {
            message = ex.toString();
        }
        response.message = message;
        ctx.body = response;
    }
}

exports.routes = routes;