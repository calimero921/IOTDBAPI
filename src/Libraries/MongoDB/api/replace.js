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

const {serverLogger} = require('server-logger');;
const errorParsing = require('../../../utils/errorParsing.js');

module.exports = function (context, collectionName, query, parameter) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/replace.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %s', query);
            logger.debug('parameter: %s', parameters);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.findOneAndReplace(query, parameter, {returnOriginal: false, upsert: true});
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.ok === 1) {
                            if (datas.value) {
                                resolve(datas.value);
                            } else {
                                let error = errorParsing(context, 'No response');
                                logger.debug('error: %j', error);
                                reject(error);
                            }
                        } else {
                            let error = errorParsing(context, 'Response error');
                            logger.debug('error: %j', error);
                            reject(error);
                        }
                    } else {
                        let error = errorParsing(context, 'No data');
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
    });
};