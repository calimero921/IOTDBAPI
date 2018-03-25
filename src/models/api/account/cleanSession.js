const Log4n = require('../../../utils/log4n.js');
const mysqlClient = require('../../mysqlclient.js');

module.exports = function () {
    const log4n = new Log4n('/models/api/users/cleanSession');
    log4n.debug('start');

    return new Promise((resolve, reject) => {
        const query = "DELETE FROM sessions WHERE session_id NOT IN (SELECT user_session_id FROM users);";
        mysqlClient(query)
            .then(result => {
                // log4n.object(result, 'result');
                if(typeof result === 'undefined') throw 'error reading database';
                resolve(true);
            })
            .catch(error => {
                log4n.error(error);
                reject(error);
            });
    });
};
