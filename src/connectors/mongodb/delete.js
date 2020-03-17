const mongoDBConnector = require('./MongoDBConnector.js');
const mongoDBError = require('./error.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, collectionName, query) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/delete.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %s', query);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.findOneAndDelete(query);
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.ok === 1) {
                            if (datas.value) {
                                resolve(datas.value);
                            } else {
                                let error = errorparsing(context, 'No response');
                                logger.debug('error: %j', error);
                                reject(error);
                            }
                        } else {
                            let error = errorparsing(context, datas);
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
                    let error = mongoDBError(context, mongoError);
                    logger.debug('error: %j', error);
                    reject(error);
                })
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    })
};