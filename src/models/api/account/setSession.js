const moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const patchAccount = require('./patch.js');
const getAccount = require('./get.js');

module.exports = function (context, id, token, session_id) {
    const log4n = new Log4n(context, '/models/api/account/setSession');
    log4n.object(id, 'id');
    log4n.object(token, 'token');
    log4n.object(session_id, 'session_id');

    return new Promise((resolve, reject) => {
        try{
            log4n.debug('storing session_id');
            if (typeof id === 'undefined' || typeof session_id === 'undefined') {
                reject(errorparsing(context, {status_code: '400'}));
                log4n.debug('done - missing parameter');
            } else {
                getAccount(context, {id: id, token: token}, 0, 0, false)
                    .then(account => {
                        let newAccount = account[0];
                        newAccount.session_id = session_id;
                        newAccount.last_connexion_date = newAccount.current_connexion_date;
                        newAccount.current_connexion_date = parseInt(moment().format('x'));
                        // log4n.object(query, 'query');
                        return patchAccount(context, id, token, newAccount);
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            reject(errorparsing(context, {status_code: '500'}));
                        } else {
                            if(typeof datas.status_code === "undefined") {
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
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch')
                    });
            }
        } catch(error) {
            log4n.debug('done - global catch');
            log4n.object(error, 'error');
            reject(errorparsing(context, error));
        }
    });
};
