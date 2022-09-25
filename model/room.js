"use strict";

const { Sequelize } = require('sequelize');
const db = require("../config/config").db;

const Room = db.sequelize.define("room", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    red_user_id: {
        type: Sequelize.STRING
    },
    blue_user_id: {
        type: Sequelize.STRING
    },
    yellow_user_id: {
        type: Sequelize.STRING
    },
    green_user_id: {
        type: Sequelize.STRING
    },
    is_game_started: {
        type: Sequelize.BOOLEAN
    },
    is_blocked: {
        type: Sequelize.BOOLEAN
    }
});

module.exports = Room;