const mongoDBConnector = require('./MongoDBConnector.js');

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
                    collection.deleteMany(query)
                        .then(datas => {
                            logger.debug('datas: %j', datas);
                            if (datas) {
                                if (datas.result.ok === 1) {
                                    resolve({deletedCount: datas.deletedCount});
                                } else {
                                    logger.debug('response error');
                                    reject(errorparsing(context, {status_code: 500}));
                                }
                            } else {
                                logger.debug('no data');
                                reject(errorparsing(context, {status_code: 500}));
                            }
                        })
                        .catch(error => {
                            logger.debug('error: %j', error);
                            reject(errorparsing(context, error));
                        });
                })
                .catch((error) => {
                    logger.debug('error: %j', error);
                    reject(errorparsing(context, error));
                });
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};