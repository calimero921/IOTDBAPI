const Log4n = require('../../../utils/log4n.js');
const setUserSession = require('./setSession.js');
// const cleanUserSession = require('./cleanSession.js');
const getUserByLoginPassword = require('./getByLoginPassword');

module.exports = function (login, password, session) {
    const log4n = new Log4n('/models/api/account/check');
    log4n.object(login, 'login');
    log4n.object(password, 'password');
    log4n.object(session, 'session');

    return new Promise((resolve, reject) => {
        getUserByLoginPassword(login, password)
            .then(result => {
                log4n.object(result[0], 'get user by login/password result');
                return setUserSession(result[0].email, session);
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
