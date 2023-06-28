/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2023 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const {MongoClient} = require('mongodb');

const configuration = require('../../config/Configuration.js');
const serverLogger = require('../ServerLogger/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

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

                    let mongoClient = new MongoClient(url, options);
                    mongoClient.connect()
                        .then(client => {
                            this.mongodbDatabase = client.db(dbName);
                            logger.debug('client binded to database');
                            resolve(this.mongodbDatabase);
                        })
                        .catch(mongoError => {
                            logger.debug('mongoError: %j', mongoError);
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
            let result = {
                status_code: 500,
                status_message: 'no error provided'
            };
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