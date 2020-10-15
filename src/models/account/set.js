const moment = require('moment');

const mongoInsert = require('../../connectors/mongodb/insert.js');
const mongoFind = require('../../connectors/mongodb/find.js');
const Converter = require('./utils/Converter.js');
const Generator = require('../utils/Generator.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, account) {
    const logger = serverLogger.child({
        source: '/models/account/set.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('account: %j', account);
            if (account) {
                let query = {};
                const generator = new Generator(context);
                const converter = new Converter(context);
                converter.json2db(account)
                    .then(convertedAccount => {
                        logger.debug('convertedAccount: %j', convertedAccount);
                        let timestamp = parseInt(moment().format('x'));
                        query = convertedAccount;
                        query.id = generator.idgen();
                        query.active = true;
                        query.admin = false;
                        query.current_connexion_date = timestamp;
                        query.last_connexion_date = timestamp;
                        query.creation_date = timestamp;
                        query.session_id = convertedAccount.session_id ? convertedAccount.session_id : "no session";
                        query.token = generator.keygen();
                        logger.debug('query: %j', query);

                        let filter = {$or: [{email: query.email}]};
                        return mongoFind(context, 'account', filter, {offset: 0, limit: 0}, true);
                    })
                    .then(foundAccount => {
                        logger.debug('foundAccount: %j', foundAccount);
                        if (foundAccount.status_code) {
                            if (foundAccount.status_code === 404) {
                                return mongoInsert(context, 'account', query);
                            } else {
                                return foundAccount;
                            }
                        } else {
                            return errorParsing(context, {
                                status_code: 409,
                                status_message: 'account already exists'
                            });
                        }
                    })
                    .then(insertedAccount => {
                        logger.debug('insertedAccount: %j', insertedAccount);
                        if (insertedAccount.status_code) {
                            return insertedAccount;
                        } else {
                            return converter.db2json(insertedAccount[0]);
                        }
                    })
                    .then(finalAccount => {
                        if (finalAccount.status_code) {
                            logger.error('error: %j', finalAccount);
                            reject(finalAccount);
                        } else {
                            logger.debug('finalAccount: %j', finalAccount);
                            resolve(finalAccount);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(error);
                    });
            } else {
                let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'})
                logger.debug('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};