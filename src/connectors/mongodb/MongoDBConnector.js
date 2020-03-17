const MongoClient = require('mongodb').MongoClient;

const mongoDBError = require('./error.js');
const configuration = require('../../config/Configuration.js');
const serverLogger = require('../../utils/serverLogger.js');

const globalPrefix = '/connectors/mongodb/MongoDBConnector.js';

class MongoDBConnector {
    constructor() {
        let logger = serverLogger.child({
            source: globalPrefix,
            httpRequestId: 'initialize'
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
            httpRequestId: context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                if (!this.mongodbDatabase.error) {
                    logger.info('existing MongoDB database connection ...');
                    resolve(this.mongodbDatabase);
                } else {
                    logger.info('connecting to MongoDB database ...');
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
                            let error = mongoDBError(context, mongoError);
                            logger.debug('error: %j', error);
                            reject(error);
                        })
                }
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorparsing(context, exception));
            }
        })
    }
}

module.exports = new MongoDBConnector();
