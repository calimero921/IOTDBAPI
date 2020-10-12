const mongoDBConnector = require('../../utils/MongoDB/MongoDBConnector.js');

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
                    return collection.findOneAndReplace(query, parameter, {returnOriginal: false, upsert: true});
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
                })
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};