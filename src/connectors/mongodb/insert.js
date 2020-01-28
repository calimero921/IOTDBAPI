const mongoDBConnector = require('./MongoDBConnector.js');
const mongoerror = require('./error.js');

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
                    collection.insertOne(query)
                        .then(datas => {
                            logger.debug('datas: %j', datas);
                            if (typeof datas === 'undefined') {
                                logger.debug('no data');
                                reject(errorparsing(context, {status_code: 500}));
                            } else {
                                if (datas.result.ok === 1) {
                                    if (typeof datas.ops === 'undefined') {
                                        logger.debug('no response');
                                        reject(errorparsing(context, {status_code: 500}));
                                    } else {
                                        resolve(datas.ops);
                                    }
                                } else {
                                    reject(errorparsing(context, {status_code: 500}));
                                    logger.debug('response error');
                                }
                            }
                        })
                        .catch(error => {
                            logger.debug( 'error: %j', error);
                            reject(mongoerror(context, error));
                        });
                })
                .catch(error => {
                    logger.debug( 'error: %j', error);
                    reject(errorparsing(context, error));
                });
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, error));
        }
    });
};