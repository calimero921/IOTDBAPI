const mongoDBConnector = require('./MongoDBConnector.js');
const mongoDBError = require('./error.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, converter, collectionName, query, parameters, overtake) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/find.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %s', query);
            logger.debug('parameter: %s', parameters);

            if (typeof overtake === 'undefined') overtake = false;
            logger.debug('overtake: %s', overtake);

            //initialisation des parametres offset et limit
            let skip = 0;
            let limit = 0;
            let sort = {};
            if (parameters) {
                if (parameters.skip) skip = parseInt(parameters.skip);
                if (parameters.limit) limit = parseInt(parameters.limit);
                if (parameters.sort) sort = parameters.sort;
            }

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort(sort)
                        .toArray()
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.length > 0) {
                            let promises = [];
                            for (let idx1 = 0; idx1 < datas.length; idx1++) {
                                if (datas.hasOwnProperty(idx1)) {
                                    promises.push(converter.db2json(datas[idx1]));
                                }
                            }
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
                            if (overtake) {
                                let error = errorparsing(context, {
                                    status_code: 404,
                                    status_message: 'No result but ok'
                                });
                                logger.error('error: %j', error);
                                resolve(error);
                            } else {
                                let error = errorparsing(context, {
                                    status_code: 404,
                                    status_message: 'No result'
                                });
                                logger.error('error: %j', error);
                                reject(error);
                            }
                        }
                    } else {
                        let error = errorparsing(context, 'No data');
                        logger.error('error: %j', error);
                        reject(error);
                    }
                })
                .catch(mongoError => {
                    let error = mongoDBError(context, mongoError);
                    logger.error('error: %j', error);
                    reject(errorparsing(context, error));
                })
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};