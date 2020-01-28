const mongoDBConnector = require('./MongoDBConnector.js');

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
                                        logger.debug('not correct record found');
                                        reject(errorparsing(context, {status_code: 404}));
                                    }
                                })
                                .catch(error => {
                                    logger.debug('error: %j', error);
                                    reject(errorparsing(context, error));
                                });
                        } else {
                            if (overtake) {
                                logger.debug('no result but ok');
                                resolve(errorparsing(context, {status_code: 404}));
                            } else {
                                logger.debug('not found');
                                reject(errorparsing(context, {status_code: 404}));
                            }
                        }
                    } else {
                        logger.debug('no data');
                        reject(errorparsing(context, {status_code: 500}));
                    }
                })
                .catch((error) => {
                    logger.debug('error: %j', error);
                    reject(errorparsing(context, error));
                })
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};