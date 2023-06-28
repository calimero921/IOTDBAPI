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

const serverLogger = require('../../ServerLogger/ServerLogger.js');
const errorParsing = require('../../../utils/errorParsing.js');

module.exports = function (context, collectionName, query, parameters, overtake) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/find.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %j', query);
            logger.debug('parameter: %j', parameters);

            if (!overtake) overtake = false;
            logger.debug('overtake: %s', overtake);

            //initialisation des parametres offset et limit
            let skip = 0;
            let limit = 0;
            let sort = {};
            if (parameters) {
                if (parameters.skip) skip = parseInt(parameters.skip);
                if (parameters.limit) limit = parseInt(parameters.limit);
                if (parameters.sort) sort = parameters.sort;
            }

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort(sort)
                        .toArray()
                })
                .then(queryResults => {
                    logger.debug('queryResults: %j', queryResults);
                    let error = errorParsing(context, {status_code: 404, status_message: 'not found'});
                    if (Array.isArray(queryResults)) {
                        if (queryResults.length === 0) {
                            if (overtake) {
                                logger.debug('error: %j', error);
                                resolve(error);
                            } else {
                                logger.error('error: %j', error);
                                reject(error);
                            }
                        } else {
                            resolve(queryResults);
                        }
                    } else {
                        if (overtake) {
                            logger.debug('error: %j', error);
                            resolve(error);
                        } else {
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    reject(errorParsing(context, mongoDBConnector.getError(context, error)));
                })
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};