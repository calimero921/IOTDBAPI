const moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const getAccount = require('./get.js');
const patchAccount = require('./patch.js');
const Generator = require('../generator.js');

module.exports = function (context, id, token) {
    const log4n = new Log4n(context, '/models/api/account/setToken');
    log4n.object(id, 'id');

    return new Promise((resolve, reject) => {
        try {
            log4n.debug('storing token');
            if (typeof id === 'undefined') {
                reject(errorparsing({status_code: '400'}));
                log4n.debug('done - missing parameter');
            } else {
                let newAccount;
                getAccount(context, {id: id, token: token}, 0, 0, false)
                    .then(account => {
                        log4n.object(account[0], 'account');
                        newAccount = account[0];
                        newAccount.last_connexion_date = newAccount.current_connexion_date;
                        newAccount.current_connexion_date = parseInt(moment().format('x'));
                        return createToken(context);
                    })
                    .then(newToken => {
                        log4n.object(newToken, 'token');
                        newAccount.token = newToken;
                        log4n.debug('updating account');
                        return patchAccount(context, id, token, newAccount);
                        // return newAccount;
                    })
                    .then(datas => {
                        log4n.object(datas, 'datas');
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas.token);
                            log4n.debug('done - ok');
                        } else {
                            reject(datas);
                            log4n.debug('done - wrong data');
                        }
                    })
                    .catch(error => {
                        log4n.debug('promise catch');
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    })
            }
        } catch (exception) {
            log4n.debug('global catch');
            log4n.object(exception, 'exception');
            reject(errorparsing(exception));
            log4n.debug('done - global catch');
        }
    })
};

function createToken(context) {
    const log4n = new Log4n(context, '/models/api/account/setToken/createToken');

    return new Promise((resolve, reject) => {
        let generator = new Generator();
        let token = generator.keygen();
        log4n.object(token, 'token');
        getAccount(context, {token: token}, 0, 0, true)
            .then(data => {
                // log4n.object(data, 'data');
                if (data.length > 0) {
                    log4n.object(token, 'token');
                    return createToken(context);
                } else {
                    log4n.debug('done - no account found for this token');
                    resolve(token);
                }
            })
            .catch(error => {
                log4n.object(error, 'Error');
                reject(error);
                log4n.debug('done - promise catch');
            })
    })
}