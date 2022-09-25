'use strict';

let config = require("./config.json");
const { Sequelize } = require('sequelize');
const debug = require("debug");
const log = debug("Config Log");
const errorLog = debug("Config ErrorLog");
const _ = require("lodash");
var migrateUsers;

var db = {};
var all_config = {};

function init() {
    return new Promise(async (resolve, reject) => {
        try {
            if (!config || !config.database || !config.database.database_name
                || !config.database.username || !config.database.password) {
                    errorLog("Database config is invalid");
                    return reject("invalid db config");
                }
            let db_config = config.database;
            //connect to database
            log(JSON.stringify(db_config));

            const sequelize = new Sequelize(db_config.database_name, db_config.username,
                db_config.password, {
                    host: db_config.host,
                    port: db_config.port,
                    dialect: db_config.dialect,
                    pool: {
                        max: db_config.pool.max,
                        min: db_config.pool.min,
                        acquire: db_config.pool.acquire,
                        idle: db_config.pool.idle
                    }
                });
            //check if needed
            // await sequelize.authenticate();
            db.sequelize = sequelize;
            log("initalized db");

            // all_config = Object.assign(all_config, cinfi);
            all_config.config = _.cloneDeep(config);
            // if (!migrateUsers) {
            //     migrateUsers = require("../migrations/20201224111029-user");
            //     await migrateUsers.up();
            // }
            return resolve();
        } catch (err) {
            errorLog(err);
            reject(err);
        }
    });
}

exports.init = init;
exports.db = db;
exports.all_config = all_config;