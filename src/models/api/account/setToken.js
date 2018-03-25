const moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const patch = require('./patch.js');
const accountGet = require('./get.js');
const Generator = require('../generator.js');

module.exports = function (email) {
    const log4n = new Log4n('/models/api/account/setToken');
    log4n.object(email, 'email');

    return new Promise((resolve, reject) => {
        try {
            log4n.debug('storing token');
            if (typeof email === 'undefined') {
                reject(errorparsing({error_code: '400'}));
                log4n.debug('done - missing parameter');
            } else {
                let query;
                accountGet({email: email}, 0, 0, false)
                    .then(account => {
                        log4n.object(account, 'account');
                        query = account[0];
                        query.last_connexion_date = query.current_connexion_date;
                        query.current_connexion_date = parseInt(moment().format('x'));
                        log4n.object(query, 'query');
                        return createToken();
                    })
                    .then(token => {
                        query.token = token;
                        // log4n.object(query, 'query');
                        return patch(query.id, query);
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            reject(errorparsing({error_code: '500'}));
                        } else {
                            if (typeof datas.error_code === "undefined") {
                                resolve(datas);
                                log4n.debug('done - ok');
                            } else {
                                reject(datas);
                                log4n.debug('done - wrong data');
                            }
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(error));
                        log4n.debug('done - promise catch')
                    });
            }
        } catch (error) {
            log4n.debug('done - global catch');
            log4n.object(error, 'error');
            reject(errorparsing(error));
        }
    });
};

function createToken() {
    const log4n = new Log4n('/models/account/setToken/createToken');

    return new Promise((resolve, reject) => {
        let generator = new Generator();
        let token = generator.keygen();
        log4n.object(token, 'token');
        let action = accountGet({token: token}, 0, 0, false)
            .then(data => {
                // log4n.object(data, 'data');
                if (data.length > 0) {
                    token = generator.keygen();
                    log4n.object(token, 'token');
                    return action();
                }
            })
            .catch(error => {
                log4n.object(error, "Error");
                // log4n.object(value, 'value');
                resolve(token);
                log4n.debug("done - promise catch");
            });
    });
}