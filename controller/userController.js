"use strict";
let userStore = require("../store/userStore");

async function insert(data) {
    await userStore.insert(data);
}

async function login(data, options= {}) {
    return await userStore.login(data, options);
}

async function logout(token, options = {}) {
    return await userStore.logout(token);
}

async function findAll(options) {
    return await userStore.findAll(options);
}

async function joinToRoom(token, options = {}) {
    return await userStore.joinToRoom(token, options);
}

async function getUserByToken(token, options={}) {
    if (!token) {
        throw new Error("Please define the token");
    }
    return await userStore.getUserByToken(token, options);
}

async function getUserMetaDetails(user_id, room_id, options={}) {
    return await userStore.getUserMetaDetails(user_id, room_id, options);
}

async function findByIds(user_ids) {
    return await userStore.findByIds(user_ids);
}

async function readAndUpdateUsers(contact_no, dob, is_eligible) {
    return await userStore.readAndUpdateUsers(contact_no, dob, is_eligible);
}
exports.insert = insert;
exports.login = login;
exports.findAll = findAll;
exports.joinToRoom = joinToRoom;
exports.getUserByToken = getUserByToken;
exports.getUserMetaDetails = getUserMetaDetails;
exports.logout = logout;
exports.findByIds = findByIds;
exports.readAndUpdateUsers = readAndUpdateUsers;