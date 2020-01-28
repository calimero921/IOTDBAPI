const MongoClient = require('mongodb').MongoClient;
const configuration = require('../../config/Configuration.js');

const serverLogger = require('../../utils/serverLogger.js');

class MongoDBConnector {
    constructor() {
        this.logger = serverLogger.child({
            source: '/connectors/mongodb/MongoDBConnector.js',
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
            source: '/connectors/mongodb/MongoDBConnector.js:getDB',
            httpRequestId: context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                if (!this.mongodbDatabase.error) {
                    logger.info('existing MongoDB database ...');
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
                        .catch(error => {
                            logger.error('error: %j', error);
                            reject(error);
                        });
                }
            } catch (exception) {
                this.logger.error('exception: %s', exception.stack);
            }
        })
    }
}

module.exports = new MongoDBConnector();
