const moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const patch = require('./patch.js');
const get = require('./get.js');

module.exports = function (email, password) {
    const log4n = new Log4n('/models/api/account/setPassword');
    log4n.object(email, 'email');
    log4n.object(password, 'password');

    return new Promise((resolve, reject) => {
        try{
            log4n.debug('storing password');
            if (typeof email === 'undefined' || typeof password === 'undefined') {
                reject(errorparsing({error_code: '400'}));
                log4n.debug('done - missing parameter');
            } else {
                get({email: email}, 0, 0, false)
                    .then(account => {
                        let query = account[0];
                        query.password = password;
                        query.last_connexion_date = query.current_connexion_date;
                        query.current_connexion_date = parseInt(moment().format('x'));
                        // log4n.object(query, 'query');
                        return patch(query.id, query);
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            reject(errorparsing({error_code: '500'}));
                        } else {
                            if(typeof datas.error_code === "undefined") {
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
        } catch(error) {
            log4n.debug('done - global catch');
            log4n.object(error, 'error');
            reject(errorparsing(error));
        }
    });
};
