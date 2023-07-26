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

module.exports = function (context, collectionName, query) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/delete.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %j', query);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    return collection.findOneAndDelete(query);
                })
                .then(deletedAccount => {
                    logger.debug('deletedAccount: %j', deletedAccount);
                    if (deletedAccount) {
                        if (deletedAccount.ok === 1) {
                            if (deletedAccount.lastErrorObject.n > 0) {
                                resolve(deletedAccount.value);
                            } else {
                                let error = errorParsing(context, {status_code: 404, status_message: 'no response'});
                                logger.debug('error: %j', error);
                                reject(error);
                            }
                        } else {
                            let error = errorParsing(context, deletedAccount);
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
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
};