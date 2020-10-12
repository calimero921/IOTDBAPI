const mongoDBConnector = require('../../utils/MongoDB/MongoDBConnector.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, collectionName, query, parameters, overtake) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/find.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %j', query);
            logger.debug('parameter: %j', parameters);

            if (!overtake) overtake = false;
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
                .then(queryResults => {
                    logger.debug('queryResults: %j', queryResults);
                    if (Array.isArray(queryResults)) {
                        if (queryResults.length === 0) {
                            let error = errorparsing(context, {status_code: 404, status_message: 'not found'});
                            if (overtake) {
                                logger.debug('error: %j', error);
                                resolve(error);
                            } else {
                                logger.error('error: %j', error);
                                reject(error);
                            }
                        } else {
                            resolve(queryResults);
                        }
                    } else {
                        let error = errorparsing(context, {status_code: 404, status_message: 'not found'});
                        if (overtake) {
                            logger.debug('error: %j', error);
                            resolve(error);
                        } else {
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    reject(errorparsing(context, mongoDBConnector.getError(context, error)));
                })
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};