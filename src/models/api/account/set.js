const moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoClientInsert = require('../../mongodbinsert.js');
const mongoClientFind = require('../../mongodbfind.js');
const Converter = require('./converter.js');
const Generator = require('../generator.js');

module.exports = function (account) {
    const log4n = new Log4n('/models/api/account/set');
    // log4n.object(account, 'account');

    //traitement d'enregistrement dans la base
    return new Promise(function (resolve, reject) {
        try {
            log4n.debug('storing account');
            const generator = new Generator();
            const converter = new Converter();
            if (typeof account === 'undefined') {
                reject(errorparsing({error_code: '400'}));
                log4n.debug('done - missing parameter');
            } else {
                let query = {};
                converter.json2db(account)
                    .then(datas => {
                        query = datas;
                        query.id = generator.idgen();
                        query.active = true;
                        query.admin = false;
                        query.current_connexion_date = parseInt(moment().format('x'));
                        query.last_connexion_date = parseInt(moment().format('x'));
                        query.creation_date = parseInt(moment().format('x'));
                        query.session_id = "no session";
                        query.token = generator.keygen();
                        log4n.object(query, 'query');

                        //recherche d'un compte pré-existant
                        let search = {$or: [{email: query.email}, {login: query.login}]};
                        return mongoClientFind('account', search, {offset:0, limit: 0}, true);
                    })
                    .then(datas => {
                        if (datas.length > 0) {
                            log4n.debug('account already exists');
                            return errorparsing({error_code: '409'});
                        } else {
                            return mongoClientInsert('account', query);
                        }
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas.error_code === "undefined") {
                            //renvoi la fiche complète
                            return converter.db2json(datas[0]);
                        } else {
                            //renvoi l'erreur de l'étape précédente
                            return datas;
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.error_code === "undefined") {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(datas);
                            log4n.debug('done - erreur dans la procédure');
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