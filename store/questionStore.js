"use strict";

let Question = require("../model/question");
const db = require("../config/config").db;
const { Op } = require("sequelize");
const questionCache = require("./cache/questionCache");
const _ = require("lodash");

async function insert(data, options = {}) {
    try {
        let final_data = {
            question: data.question,
            option_one: data.option_one,
            option_two: data.option_two,
            option_three: data.option_three,
            option_four: data.option_four,
            answer: data.answer,
            is_jaina_card_question: data.is_jaina_card_question,
            color: data.color
        };
        let question = await Question.create(final_data);
        return question;
    } catch (ex) {
        throw ex;
    }
}

function findAll(options) {
    try {
        return Question.findAll({
            where: {
                [Op.and]: [{
                    question: 'janedoe'
                }]
            }
        });
    } catch(ex) {
        throw ex;
    }
}

function getQuestionById(id, options) {
    try {
        if (!id) {
            throw new Error("Please specify question id");
        }
        return Question.findOne({
            where: {
                [Op.and]: [{
                    id: id
                }]
            }
        });
    } catch (ex) {
        throw ex;
    }
}

function getAllByColor(options) {
    try {
        if (!options || !options.color) {
            throw new Error("Please specify color");
        }
        return Question.findAll({
            where: {
                [Op.and]: [{
                    color: options.color
                }]
            }
        });
    } catch(ex) {
        throw ex;
    }
}

async function getRandomQuestion(color, questionList, options = {}) {
    try {
        if (questionList && questionList.length > 0) {
            questionList = questionList.join(",");
        }
        let query = `select * from questions`;
        if (questionList.length > 0) {
            query += ` where id NOT IN (${questionList})`;
        }
        query += ` ORDER BY random() limit 1`;
        return await db.sequelize.query(query, {model: Question});
    } catch (ex) {
        throw ex;
    }
}

async function getQuestionForUserIdForRoom(dice_details, options = {}) {
    try {
        if (!dice_details || !dice_details.room_id || !dice_details.user_id ||
            !dice_details.round_no || !dice_details.dice_no || !dice_details.color) {
                throw new Error("Please specify mandatory details");
        }
        let questionsList = await questionCache.getQuestionsListForRoom(dice_details.room_id);
    
        if (questionsList && questionsList.length > 0) {
            _.forEach(questionsList, q => parseInt(q));
        }
    
        let question = await getRandomQuestion(dice_details.color, questionsList);
    
        if (question && question.length > 0) {
            question = question[0];
        }
        if (!question) {
            throw new Error("Failed to find the room");
        }

        await questionCache.setQuestionsListForRoom(dice_details.room_id, question.id);
    
        let result = {
            question_id: question.id,
            question: question.question,
            option_one: question.option_one,
            option_two: question.option_two,
            option_three: question.option_three,
            option_four: question.option_four
        }
        
        return result;
    } catch (ex) {
        throw ex;
    }
}

exports.insert = insert;
exports.findAll = findAll;
exports.getQuestionForUserIdForRoom = getQuestionForUserIdForRoom;
exports.getQuestionById = getQuestionById;