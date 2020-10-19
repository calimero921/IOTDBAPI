/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const mongoFind = require('../../connectors/mongodb/find.js');
const Converter = require('./utils/Converter.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, filter, skip, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/device/get.js',
        httpRequestId: context.httpRequestId
    });

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            if (!limit) limit = 0;
            logger.debug('limit: %s', limit);
            if (!skip) skip = 0;
            logger.debug('skip: %s', skip);
            if (!overtake) overtake = false;
            logger.debug('overtake: %s', overtake);

            logger.debug('filter: %s', filter);
            let parameter = {};
            if (skip) parameter.skip = skip;
            if (limit) parameter.limit = limit;
            logger.debug('parameter: %j', parameter);

            mongoFind(context, 'device', filter, parameter, overtake)
                .then(devices => {
                    if (devices) {
                        if (devices.status_code) {
                            if (overtake) {
                                logger.debug('devices: %j', devices);
                                resolve(devices);
                            } else {
                                logger.error('error: %j', devices);
                                reject(devices);
                            }
                        } else {
                            if (Array.isArray(devices)) {
                                let promises = [];
                                const converter = new Converter(context);
                                for (let idx = 0; idx < devices.length; idx++) {
                                    promises.push(converter.db2json(devices[idx]));
                                }
                                if (promises.length > 0) {
                                    Promise.all(promises)
                                        .then(result => {
                                            logger.debug('result: %j', result);
                                            if (result.length > 0) {
                                                resolve(result);
                                            } else {
                                                let error = errorParsing(context, {
                                                    status_code: 404,
                                                    status_message: 'no correct record found'
                                                });
                                                logger.error('error: %j', error);
                                                reject(error);
                                            }
                                        })
                                        .catch(error => {
                                            logger.debug('error: %j', error);
                                            reject(context, error);
                                        });
                                } else {
                                    let error = errorParsing(context, {
                                        status_code: 404,
                                        status_message: 'no device found'
                                    })
                                    logger.error('error: %j', error);
                                    if (overtake) {
                                        logger.debug('error: %j', error);
                                        resolve(error);
                                    } else {
                                        logger.error('error: %j', error);
                                        reject(error);
                                    }
                                }
                            } else {
                                let error = errorParsing(context, {
                                    status_code: 404,
                                    status_message: 'no account found'
                                })
                                if (overtake) {
                                    logger.debug('error: %j', error);
                                    resolve(error);
                                } else {
                                    logger.error('error: %j', error);
                                    reject(error);
                                }
                            }
                        }
                    } else {
                        let error = errorParsing(context, {status_code: 404, status_message: 'no device found'})
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
                    logger.debug('error: %j', error);
                    reject(error);
                });
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};
