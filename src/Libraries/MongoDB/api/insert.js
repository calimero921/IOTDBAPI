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

const mongoDBConnector = require('../MongoDBConnector.js');
const mongoFind = require('./find.js')

const serverLogger = require('../../ServerLogger/ServerLogger.js');
const errorParsing = require('../../../utils/errorParsing.js');

module.exports = function (context, collectionName, query) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/insert.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %j', query);

            let collection;
            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    collection = mongodbDatabase.collection(collectionName);
                    return collection.insertOne(query);
                })
                .then(insertedResult => {
                    logger.debug('insertedResult: %j', insertedResult);
                    if (insertedResult) {
                        if (insertedResult.acknowledged) {
                            let filter = {$or: [{_id: insertedResult.insertedId}]};
                            return mongoFind(context, collectionName, filter, {offset: 0, limit: 0}, true);
                        } else {
                            let error = errorParsing(context, 'no result');
                            logger.error('error: %j', error);
                            return (error);
                        }
                    } else {
                        let error = errorParsing(context, 'no data');
                        logger.error('error: %j', error);
                        return (error);
                    }
                })
                .then(insertedValue => {
                    if (insertedValue) {
                        if (insertedValue.status_code) {
                            reject(insertedValue);
                        } else {
                            resolve(insertedValue);
                        }
                    } else {
                        let error = errorParsing(context, 'no data');
                        logger.error('error: %j', error);
                        reject(error);
                    }
                })
                .catch(mongoError => {
                    let error = mongoDBConnector.getError(context, mongoError);
                    logger.debug('error: %j', error);
                    reject(error);
                })
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};