"use strict";
var cn = require("../../../config/config");
var redis = require("redis");
var when = require("when");
var redis_config = {};
var client = {};
var pubsub_subscriber_client = {};
var pubsub_publisher_client = {};

var debug = require('debug');
var log = debug('redisClient:log');
var error = debug('redisClient:error');

var eventListeners = {};

when(cn.init(), function Success() {

	redis_config = cn.all_config.config.redis;
	client = redis.createClient(redis_config.port, redis_config.host, {
		socket_nodelay: true
	});
});

exports.keys = function (pattern) {
    return new Promise((resolve, reject) => {
        pattern = pattern + "*";
        client.keys(pattern, function (err, keys) {
            if (err) {
                reject(err);
            } else {
                resolve(keys);
            }
        });
    });
};

exports.set = function (key, value) {
    return new Promise((resolve, reject) => {
        try {
            if (typeof value == "object")
                value = JSON.stringify(value);
            if (value === undefined || value === null) {
                return resolve;
            }
            client.set(key, value, function (err, reply) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
            resolve();
        } catch (err) {
            reject(err);
            error(err);
        }
    });
};

/**
 * @param {String} key - key name 
 * @param {String|Number|Object} - the data can be string or Object
 * @param {Number} ttl - expiry time in seconds
 */
exports.setex = function (key, value, ttl) {
	return new Promise((resolve, reject) => {
        try {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            if (value === undefined || value === null) {
                resolve();
            }
            client.setex(key, ttl, value, function (err, reply) {
                if (!err) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        } catch (e) {
            reject();
        }
    });
};

var expire = function (key, time, promise) {
    return new Promise((resolve, reject) => {
        try {
            client.expire(key, time);
            resolve();
        } catch (err) {
            reject();
        }
    });
};

exports.expire = expire;
var incr = function (key, value = 1) {
	return new Promise((resolve, reject) => {
        try {
            client.INCRBYFLOAT(key, value, function (error, value) {
                resolve(parseFloat(value));
            });
        } catch (err) {
            reject();
        }
    });
};

exports.incr = incr;
exports.get = async function (key, isObject) {
	return new Promise((resolve, reject) => {
        try {
            // await globalPromise;
            client.get(key, function (err, value) {
                if (!err) {
                    if (null !== value && isObject) {
                        value = JSON.parse(value);
                    }
                    resolve(value);
                } else {
                    reject(err);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

var del = function (key) {
	return new Promise((resolve, reject) => {
        client.del(key, function (err, reply) {
            if (err) {
                reject(err);
            } else {
                resolve(reply);
            }
        });
    });
};


exports.getset = function (key, payload) {
	return new Promise((resolve, reject) => {
        client.getset(key, payload, function (err, reply) {
            if (!err) {
                resolve(reply);
            } else {
                reject(err);
            }
        });
    });
};

/**
 * Adds members to set in redis
 * @async
 * @param {String} set - set name
 * @param {ArrayLike>} members - list of members
 */
async function sadd(set, members) {
	await client.sadd(set, members);
}

/**
 * Removes elements from set
 * @async
 * @param {String} set - set name
 * @param {ArrayLike} members - list of members to be removed from set
 */
function srem(set, members) {
	return new Promise((fulfill, reject) => {
		client.srem(set, members, function (err, result) {
			if (err) {
				reject(err);
			} else {
				fulfill();
			}
		});
	});
}

/**
 * 
 * @param {String} set - set name
 * @param {String|Object} member - element to check if it is the member of the specified set
 * 
 * @returns {Promise<boolean>} - if it is member or not
 */
function sismember(set, member) {
	return new Promise((resolve, reject) => {
        client.sismember(set, member, function (err, result) {
            if (err) {
                reject(err);
            } else {
                var r = result ? true : false;
                resolve(r);
            }
        });
    });
}

/**
 * Get list of members in the specified set
 * @async
 * @param {String} set- key name
 * 
 * @returns {Promise<Array>}- set members
 */
function smembers(set) {
	return new Promise((resolve, reject) => {
        client.smembers(set, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function scard(set) {
	return new Promise((resolve, reject) => {
        client.scard(set, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

// sadd("online",["n","asd","asdasd"]);
// srem("online","n");
// sismember('online','asd');
// smembers('online');
exports.sismember = sismember;
exports.smembers = smembers;
exports.scard = scard;
exports.srem = srem;
exports.sadd = sadd;
exports.del = del;