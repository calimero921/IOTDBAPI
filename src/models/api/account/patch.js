const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoFind = require('../../../connectors/mongodb/find.js');
const mongoUpdate = require('../../../connectors/mongodb/update.js');
const Converter = require('./utils/converter.js');

module.exports = function (context, id, token, new_account) {
    const log4n = new Log4n(context, '/models/api/account/patch');
    log4n.object(id, 'id');
    log4n.object(token, 'token');
    log4n.object(new_account, 'new_account');

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.debug('storing account');
            let converter = new Converter(context);
            if (typeof id === 'undefined' || typeof token === 'undefined' || typeof new_account === 'undefined') {
                reject(errorparsing(context, {status_code: 400}));
                log4n.debug('done - missing paramater')
            } else {
                let query = {id: id, token: token};
                let parameter = {};
                log4n.debug('converting json data to db');
                converter.json2db(new_account)
                    .then(datas => {
                        // log4n.object(datas,'datas');
                        if (typeof datas.status_code === 'undefined') {
                            parameter = datas;
                            //recherche d'un compte pré-existant
                            return mongoFind(context, 'account', query, {offset: 0, limit: 0}, true)
                        } else {
                            return datas;
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.status_code === 'undefined') {
                            if (datas.length > 0) {
                                return mongoUpdate(context, 'account', query, parameter);
                            } else {
                                log4n.debug('account doesn\'t exist');
                                return errorparsing(context, {status_code: '404'});
                            }
                        } else {
                            return datas;
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.status_code === 'undefined') {
                            log4n.debug('converting db data to json');
                            return converter.db2json(datas);
                        } else {
                            return datas;
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorparsing(context, datas));
                            log4n.debug('done - error');
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    })
            }
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorparsing(context, error));
            log4n.debug('done - global catch');
        }
    })
};
