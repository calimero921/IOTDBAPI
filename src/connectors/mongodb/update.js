const mongoDBConnector = require('../../utils/MongoDB/MongoDBConnector.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, collectionName, query, newValue) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/update.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %s', query);
            logger.debug('parameter: %s', newValue);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    let operators = {"$set": newValue};
                    let options = {
                        returnOriginal: false,
                        upsert: true
                    };
                    return collection.findOneAndUpdate(query, operators, options);
                })
                .then(updatedValue => {
                    logger.debug('updatedValue: %j', updatedValue);
                    if (updatedValue) {
                        if (updatedValue.ok === 1) {
                            if (updatedValue.value) {
                                resolve(updatedValue.value);
                            } else {
                                let error = errorParsing(context, 'no response');
                                logger.debug('error: %j', error);
                                reject(error);
                            }
                        } else {
                            let error = errorParsing(context, updatedValue);
                            logger.debug('error: %j', error);
                            reject(error);
                        }
                    } else {
                        let error = errorParsing(context, 'no data');
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
            reject(errorParsing(context, exception));
        }
    })
};