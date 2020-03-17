const mongoDBConnector = require('./MongoDBConnector.js');
const mongoDBError = require('./error.js');

const serverLogger = require('../../utils/serverLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, converter, collectionName, query, parameters) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/update.js',
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
                    let operators = {"$set": parameters};
                    let options = {
                        returnOriginal: false,
                        upsert: true
                    };
                    return collection.findOneAndUpdate(query, operators, options);
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.ok === 1) {
                            if (datas.value) {
                                return converter.db2json(datas.value);
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
                .then(datas => {
                    if (datas) {
                        if (datas.status_code) {
                            logger.debug('error: %j', datas);
                            reject(datas);
                        } else {
                            logger.debug('datas: %j', datas);
                            resolve(datas);
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
            console.log('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    })
};