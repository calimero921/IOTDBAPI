const Log4n = require('../../../utils/log4n.js');
const setSession = require('./setSession.js');
const accountGet = require('./get');

module.exports = function (login, password, session) {
    const log4n = new Log4n('/models/api/account/check');
    log4n.object(login, 'login');
    log4n.object(password, 'password');
    log4n.object(session, 'session');

    return new Promise((resolve, reject) => {
        accountGet({login: login, password: password}, 0, 0, false)
            .then(result => {
                log4n.object(result[0], 'result');
                if(typeof session === 'undefined') {session = result[0].session_id}
                return setSession(result[0].id, session);
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
