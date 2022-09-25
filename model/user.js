"use strict";

const { Sequelize } = require('sequelize');
const db = require("../config/config").db;

const Users = db.sequelize.define('user', {
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    contact_no: {
        type: Sequelize.STRING
    },
    dob: {
        type: Sequelize.DATEONLY
    },
    city: {
        type: Sequelize.STRING
    },
    state: {
        type: Sequelize.STRING
    },
    is_eligible: {
        type: Sequelize.BOOLEAN
    }
});

module.exports = Users;