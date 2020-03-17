const mongoDBConnector = require('./MongoDBConnector.js');
const mongoDBError = require('./error.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

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
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.result.ok === 1) {
                            if (datas.ops) {
                                resolve(datas.ops);
                            } else {
                                let error = errorparsing(context, 'no response');
                                logger.error('error: %j', error);
                                reject(error);
                            }
                        } else {
                            let error = errorparsing(context, 'Response error');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    } else {
                        let error = errorparsing(context, 'No data');
                        logger.error('error: %j', error);
                        reject(error);
                    }
                })
                .catch(mongoError => {
                    let error = mongoDBError(context, mongoError);
                    logger.debug('error: %j', error);
                    reject(error);
                })
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};