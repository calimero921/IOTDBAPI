const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoClientFind = require('../../mongodbfind.js');
const mongoClientUpdate = require('../../mongodbupdate.js');
const setToken = require('./setToken.js');
const Converter = require('./converter.js');

module.exports = function (id, token, new_account) {
    const log4n = new Log4n('/models/api/account/patch');
    log4n.object(id, 'id');
    log4n.object(token, 'token');
    log4n.object(new_account, 'new_account');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        try {
            log4n.debug('storing account');
            let converter = new Converter();
            if (typeof id === 'undefined' || typeof token === 'undefined' || typeof new_account === 'undefined') {
                reject(errorparsing({error_code: 400}));
                log4n.debug('done - missing paramater')
            } else {
                let query = {id: id, token: token};
                let updateDatas = {};
                log4n.debug('preparing datas');
                //au cas ou on usurperait le account
                converter.json2db(new_account)
                    .then(datas => {
                        // log4n.object(datas,'datas');
                        updateDatas = datas;

                        //recherche d'un compte pré-existant
                        return mongoClientFind('account', query, {offset: 0, limit: 0}, true)
                    })
                    .then(datas => {
                        if (datas.length > 0) {
                            return mongoClientUpdate('account', query, updateDatas)
                        } else {
                            log4n.debug('account doesn\'t exist');
                            return errorparsing({error_code: '404'});
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.error_code === 'undefined') {
                            return setToken(id);
                        }
                        return datas
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.error_code === 'undefined') {
                            log4n.debug('done - ok');
                            return converter.db2json(datas);
                        } else {
                            log4n.debug('done - error');
                            return datas;
                        }
                    })
                    .then(datas => {
                        if (typeof datas.error_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorparsing(datas));
                            log4n.debug('done - error');
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(error));
                        log4n.debug('done - global catch');
                    })
            }
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorparsing(error));
            log4n.debug('done - global catch');
        }
    })
};
