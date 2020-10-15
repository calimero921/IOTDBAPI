const MongoClient = require('mongodb').MongoClient;

const configuration = require('../../config/Configuration.js');
const serverLogger = require('../ServerLogger.js');
const errorParsing = require('../errorParsing.js');

const globalPrefix = '/utils/MongoDB/MongoDBConnector.js';

class MongoDBConnector {
    constructor() {
        let logger = serverLogger.child({
            source: globalPrefix,
            httpRequestId: 'initialize',
            authorizedClient: 'internal'
        });

        try {
            this.mongodbDatabase = {error: 'no current database connected'};
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
        }
    }

    getDB(context) {
        let logger = serverLogger.child({
            source: globalPrefix + ':getDB',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                if (!this.mongodbDatabase.error) {
                    logger.debug('existing MongoDB database connection ...');
                    resolve(this.mongodbDatabase);
                } else {
                    logger.debug('connecting to MongoDB database ...');
                    let url = configuration.mongodb.url;
                    logger.debug('url: %s', url);
                    let options = configuration.mongodb.options;
                    logger.debug('options: %j', options);
                    let dbName = configuration.mongodb.dbName;
                    logger.debug('dbName: %j', dbName);

                    MongoClient.connect(url, options)
                        .then(client => {
                            logger.debug('client connection status: %s', client.isConnected());
                            this.mongodbDatabase = client.db(dbName);
                            logger.debug('client binded to database');
                            resolve(this.mongodbDatabase);
                        })
                        .catch(mongoError => {
                            let error = this.getError(context, mongoError);
                            logger.debug('error: %j', error);
                            reject(error);
                        })
                }
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorParsing(context, exception));
            }
        })
    }

    getError(context, error) {
        const logger = serverLogger.child({
            source: globalPrefix + ':getError',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        try {
            logger.debug('error: %j', error);
            let result = {};
            if (error.status_code) {
                result = error;
            } else {
                switch (error.code) {
                    case 11000:
                        result.status_code = 409;
                        result.status_message = "Duplicate entry";
                        break;
                    default:
                        result.status_code = error.code;
                        result.status_message = error.message;
                        break;
                }
            }
            logger.debug('result: %j', result);
            return errorParsing(context, result);
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            return errorParsing(context, exception);
        }
    }
}

module.exports = new MongoDBConnector();
