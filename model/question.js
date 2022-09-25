"use strict";

const { Sequelize } = require('sequelize');
const db = require("../config/config").db;

const Question = db.sequelize.define("question", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question: {
        type: Sequelize.STRING
    },
    option_one: {
        type: Sequelize.STRING
    },
    option_two: {
        type: Sequelize.STRING
    },
    option_three: {
        type: Sequelize.STRING
    },
    option_four: {
        type: Sequelize.STRING
    },
    answer: {
        type: Sequelize.STRING
    },
    is_jaina_card_question: {
        type: Sequelize.BOOLEAN
    },
    color: {
        type: Sequelize.STRING
    }
});

module.exports = Question;