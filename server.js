"use strict";

const debug = require("debug");
const log = debug("Server log");
const errorLog = debug("Server error");
const Koa = require("koa");
const cors = require('@koa/cors');
const Router = require("koa-router");
const fs = require("fs");
const _ = require("lodash");
const bodyParser = require("koa-bodyparser");
const http = require("http");
const app = new Koa();
let final_server = http.createServer(app.callback());
var io = require('socket.io')(final_server, {
    cors: {
        origin: '*',
    }
});
const when = require("when");
let cn = require("./config/config");
let socketServer = require("./socket.io/socketServer")(io);

var router = new Router();
// var server;

var init = cn.init();

app.use(cors({
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    allowHeaders: ['authorization',
        'withcredentials',
        'x-requested-with',
        'x-forwarded-for',
        'x-real-ip',
        'x-customheader',
        'user-agent',
        'keep-alive',
        'host',
        'accept',
        'connection',
        'upgrade',
        'content-type',
        'dnt',
        'if-modified-since',
        'cache-control',
        'Access-Control-Allow-Origin'
    ],
}));

// var corsOptions = {
//     origin: '*'
// };

// app.use(cors(corsOptions));
app.use(bodyParser());

app.use(async function validateContentType(ctx, next) {
    if (["post", "delete"].includes(_.get(ctx, "request.method", "").toLowerCase())) {
        if (_.get(ctx, "request.headers.content-type") !== "application/json") {
            ctx.throw(400, "Content-type must be set to json/application. JSON expected.");
        }
    }
    await next();
});

function startServer(port) {
    if (port === null || port === undefined) {
        port = 8005;
    }

    log(`Starting app server on port ${port}`);

    return new Promise((resolve, reject) => {
        when(init, function() {
            let normalizedPath = require("path").join(__dirname, "routes");

            fs.readdirSync(normalizedPath).forEach(file => {
                let currentRoute = require(`${require("path").join(normalizedPath, file)}`);
                router = currentRoute.routes(router);
            });
        
            app
                .use(router.routes())
                .use(router.allowedMethods());
        
            // server = app.listen(port, () => {
            //     log(`Server started on ${port}`);
            // });
        
            final_server.listen(port);
            resolve();
        },
		function (err) {
			errorLog(err);
		});
    });
}

// io.on('connection', function (socket) {
//     socket.on('chat message', function (msg) {
//         try {
//             console.log("hhhh");
//             log("I received the msg");
//             io.emit('chat message', "Received ur msg");
//         } catch (ex) {
//             errorLog(ex);
//         } 
//     });
// });

process.on('SIGINT', async function () {
    // if (server) {
    //     server.close();
    // }
    if (final_server) {
        final_server.close();
    }
    log("sigint");

    setTimeout(() => { process.exit(0) }, 10);
});

exports.startServer = startServer;
exports.io = io;
