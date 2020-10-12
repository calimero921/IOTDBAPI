const mongoDBConnector = require('../../utils/MongoDB/MongoDBConnector.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, collectionName, query) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/insert.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %j', query);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.insertOne(query);
                })
                .then(insertedValue => {
                    logger.debug('insertedValue: %j', insertedValue);
                    if (insertedValue) {
                        if (insertedValue.result) {
                            if (insertedValue.result.ok === 1) {
                                if (insertedValue.ops) {
                                    resolve(insertedValue.ops);
                                } else {
                                    let error = errorParsing(context, 'no response');
                                    logger.error('error: %j', error);
                                    reject(error);
                                }
                            } else {
                                let error = errorParsing(context, 'response error');
                                logger.error('error: %j', error);
                                reject(error);
                            }
                        } else {
                            let error = errorParsing(context, 'no result');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    } else {
                        let error = errorParsing(context, 'no data');
                        logger.error('error: %j', error);
                        reject(error);
                    }
                })
                .catch(mongoError => {
                    let error = mongoDBConnector.getError(context, mongoError);
                    logger.debug('error: %j', error);
                    reject(error);
                })
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};