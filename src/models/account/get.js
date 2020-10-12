const mongoFind = require('../../connectors/mongodb/find.js');
const Converter = require('./utils/Converter.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, filter, skip, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/account/get.js',
        httpRequestId: context.httpRequestId
    });

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            if (!limit) limit = 0;
            logger.debug('limit: %s', limit);
            if (!skip) skip = 0;
            logger.debug('skip: %s', skip);
            if (!overtake) overtake = false;
            logger.debug('overtake: %s', overtake);

            logger.debug('filter: %s', filter);
            let parameter = {"skip": skip, "limit": limit};
            logger.debug('parameter: %j', parameter);
            mongoFind(context, 'account', filter, parameter, overtake)
                .then(accounts => {
                    if (Array.isArray(accounts)) {
                        let promises = [];
                        const converter = new Converter(context);
                        for (let idx = 0; idx < accounts.length; idx++) {
                            promises.push(converter.db2json(accounts[idx]));
                        }
                        if (promises.length > 0) {
                            Promise.all(promises)
                                .then(result => {
                                    logger.debug('result: %j', result);
                                    if (result.length > 0) {
                                        resolve(result);
                                    } else {
                                        let error = errorparsing(context, {
                                            status_code: 404,
                                            status_message: 'No correct record found'
                                        });
                                        logger.error('error: %j', error);
                                        reject(error);
                                    }
                                })
                                .catch(error => {
                                    logger.debug('error: %j', error);
                                    reject(context, error);
                                });
                        } else {
                            let error = errorparsing(context, {status_code: 404, status_message: 'no account found'})
                            logger.error('error: %j', error);
                            if (overtake) {
                                resolve(error);
                            } else {
                                reject(error);
                            }
                        }
                    } else {
                        logger.debug('error: %j', accounts);
                        if (overtake) {
                            resolve(accounts);
                        } else {
                            reject(accounts);
                        }
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    reject(errorparsing(context, error));
                });
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};
