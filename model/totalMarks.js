"use strict";

const { Sequelize } = require('sequelize');
const db = require("../config/config").db;

const TotalMarks = db.sequelize.define('total_mark', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.STRING
    },
    room_id: {
        type: Sequelize.INTEGER
    },
    round_no: {
        type: Sequelize.INTEGER
    },
    marks: {
        type: Sequelize.INTEGER
    },
    is_game_over: {
        type: Sequelize.BOOLEAN
    },
    winner_user_id: {
        type: Sequelize.TEXT
    },
    avg_time_taken: {
        type: Sequelize.FLOAT
    }
});

module.exports = TotalMarks;