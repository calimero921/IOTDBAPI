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

import serverLogger from 'lib-server-logger';
import mongoDBConnector from 'lib-mongodb-connector';

import errorParsing from '../../utils/errorParsing.mjs';

export default function (context, collectionName, query, newValue) {
    const logger = serverLogger.child({
        source: '/connectors/mongodb/update.mjs',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('collectionName: %s', collectionName);
            logger.debug('query: %j', query);
            logger.debug('parameter: %j', newValue);

            mongoDBConnector.getDB(context)
                .then(mongodbDatabase => {
                    let collection = mongodbDatabase.collection(collectionName);
                    let operators = {"$set": newValue};
                    let options = {
                        returnDocument : 'after',
                        upsert: true
                    };
                    return collection.findOneAndUpdate(query, operators, options);
                })
                .then(updatedValue => {
                    logger.debug('updatedValue: %j', updatedValue);
                    if (updatedValue) {
                        //ancienne valeur
                        resolve(updatedValue);
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
            console.log('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
};