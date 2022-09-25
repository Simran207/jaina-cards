"use strict";

const { Sequelize } = require('sequelize');
const db = require("../config/config").db;

const Score = db.sequelize.define('score', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.STRING
    },
    is_answered: {
        type: Sequelize.BOOLEAN
    },
    room_id: {
        type: Sequelize.INTEGER
    },
    question_id: {
        type: Sequelize.INTEGER
    },
    round_no: {
        type: Sequelize.INTEGER
    },
    dice_no: {
        type: Sequelize.INTEGER
    },
    score: {
        type: Sequelize.INTEGER
    },
    duration: {         //time in millis
        type: Sequelize.INTEGER
    }
});

module.exports = Score;