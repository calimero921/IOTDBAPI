const mongoDBConnector = require('../../utils/MongoDB/MongoDBConnector.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, collectionName, query) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/deleteall.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug(collection, 'collection');
            logger.debug(query, 'query');
            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.deleteMany(query);
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.result.ok === 1) {
                            resolve({deletedCount: datas.deletedCount});
                        } else {
                            let error = errorparsing(context, 'Response error');
                            logger.debug('error: %j', error);
                            reject(error);
                        }
                    } else {
                        let error = errorparsing(context, 'No data');
                        logger.debug('error: %j', error);
                        reject(error);
                    }
                })
                .catch(mongoError => {
                    let error = mongoDBConnector.getError(context, mongoError);
                    logger.debug('error: %j', error);
                    reject(error);
                });
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};