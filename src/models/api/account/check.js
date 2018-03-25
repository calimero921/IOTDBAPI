const Log4n = require('../../../utils/log4n.js');
const setUserSession = require('./setSession.js');
// const cleanUserSession = require('./cleanSession.js');
const getUserByEmailPassword = require('./getByEmailPassword');

module.exports = function (email, password, session_id) {
    const log4n = new Log4n('/models/api/account/check');
    log4n.object(email, 'email');
    log4n.object(password, 'password');
    log4n.object(session_id, 'session_id');

    return new Promise((resolve, reject) => {
        getUserByEmailPassword(email, password)
            .then(result => {
                // log4n.object(result[0], 'get user by login/password');
                return setUserSession(email, session_id);
            })
            .then(result => {
                log4n.object(result, 'set Session');
                resolve(true);
            })
            .catch(error => {
                log4n.error(error);
                reject(error);
            });
    });
};
