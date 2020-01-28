const mongoDBConnector = require('./MongoDBConnector.js');

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
                                return errorparsing(context, {status_code: 500});
                            }
                        } else {
                            return errorparsing(context, {status_code: 500});
                        }
                    } else {
                        return (errorparsing(context, {status_code: 500}));
                    }
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.status_code) {
                            logger.debug('error: %j', datas);
                            reject(datas);
                        } else {
                            resolve(datas);
                        }
                    } else {
                        logger.debug('no data');
                        reject(errorParsing(context, {status_code: 500}));
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    reject(errorparsing(context, error));
                })
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    })
};