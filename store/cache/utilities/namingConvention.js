"use strict";

exports.getUserTokenKey = function (token) {
    return `token-${token}`;
};

exports.getLatestRoomKey = function () {
    return `latest_room`;
};

exports.getTurnInRoomKey = function (room_id) {
    return `turn-${room_id}`
}

exports.getIsFirstTimeInRoomKey = function (room_id) {
    return `first_time-${room_id}`
}

exports.getLatestQuestionNoForRoomKey = function (room_id) {
    return `latest_question_no_for_room-${room_id}`;
};

exports.getQuestionsListForRoomKey = function (room_id) {
    return `questions_lists_for_room-${room_id}`;
};

exports.getUserMetaDetailsKey = function (user_id, room_id) {
    return `user_meta_details-${user_id}-${room_id}`;
};

exports.getUserLoginTimeKey = function (user_id, round_no) {
    return `user_login_time-${user_id}-${round_no}`;
};