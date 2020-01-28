const mongoDBConnector = require('./MongoDBConnector.js');

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
                    collection.findOneAndDelete(query)
                        .then(datas => {
                            logger.debug('datas: %j', datas);
                            if (datas) {
                                if (datas.ok === 1) {
                                    if (datas.value) {
                                        resolve(datas.value);
                                    } else {
                                        logger.debug('not found');
                                        reject(errorparsing(context, {status_code: 404}));
                                    }
                                } else {
                                    logger.debug('error: %j', datas);
                                    reject(errorparsing(context, {status_code: 500}));
                                }
                            } else {
                                logger.debug('no data');
                                reject(errorparsing(context, {status_code: 500}));
                            }
                        })
                        .catch(error => {
                            logger.debug( 'error: %j', error);
                            reject(errorparsing(context, error));
                        })
				})
				.catch(error => {
					logger.debug( 'error: %j', error);
					reject(errorparsing(context, error));
                })
        } catch (exception) {
            logger.debug( 'exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    })
};