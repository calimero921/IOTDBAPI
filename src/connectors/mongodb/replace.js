const mongoDBConnector = require('./MongoDBConnector.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, collectionName, query, parameter) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/replace.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %s', query);
            logger.debug('parameter: %s', parameters);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    collection.findOneAndReplace(query, parameter, {returnOriginal: false, upsert: true})
                        .then(datas => {
                            logger.debug('datas: %j', datas);
                            if (datas) {
                                if (datas.ok === 1) {
                                    if (datas.value) {
                                        resolve(datas.value);
                                    } else {
                                        logger.debug('no response');
                                        reject(errorparsing(context, {status_code: 500}));
                                    }
                                } else {
                                    logger.debug('response error');
                                    reject(errorparsing(context, {status_code: 500}));
                                }
                            } else {
                                logger.debug('no data');
                                reject(errorparsing(context, {status_code: 500}));
                            }
                        })
                        .catch((error) => {
                            logger.debug('error: %j', error);
                            reject(errorparsing(context, error));
                        });
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};