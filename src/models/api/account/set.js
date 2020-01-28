const moment = require('moment');

const mongoClientInsert = require('../../../connectors/mongodb/insert.js');
const mongoFind = require('../../../connectors/mongodb/find.js');
const Converter = require('./utils/converter.js');
const Generator = require('../generator.js');

const serverLogger = require('../../../utils/serverLogger.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, account) {
    const logger = serverLogger.child({
        source: '/models/api/account/set.js',
        httpRequestId: context.httpRequestId
    });
    logger.debug( 'account: %j', account);

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('storing account');
            const generator = new Generator(context);
            const converter = new Converter(context);
            if (typeof account === 'undefined') {
                logger.debug('missing parameter');
                reject(errorparsing(context, {status_code: '400'}));
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
                        logger.debug(query, 'query');

                        //recherche d'un compte pré-existant
                        let search = {$or: [{email: query.email}]};
                        return mongoFind(context, converter,'account', search, {offset:0, limit: 0}, true);
                    })
                    .then(datas => {
                        if (datas.length > 0) {
                            logger.debug('account already exists');
                            return errorparsing(context, {status_code: '409'});
                        } else {
                            return mongoClientInsert(context, 'account', query);
                        }
                    })
                    .then(datas => {
                        if (datas.status_code) {
                            //renvoi l'erreur de l'étape précédente
                            return datas;
                        } else {
                            logger.debug('datas: %j', datas);
                            //renvoi la fiche complète
                            return converter.db2json(datas[0]);
                        }
                    })
                    .then(datas => {
                        // logger.debug(datas, 'datas');
                        if (datas.status_code) {
                            reject(datas);
                        } else {
                            resolve(datas);
                        }
                    })
                    .catch(error => {
                        logger.debug( 'error: %j', error);
                        reject(errorparsing(context, error));
                    });
            }
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};