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

const mongoFind = require('../../Libraries/MongoDB/api/find.js');
const Converter = require('../utils/Converter.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, filter, skip, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/account/get.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
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

            mongoFind(context, 'account', filter, parameter, overtake)
                .then(accounts => {
                    if (accounts) {
                        if (accounts.status_code) {
                            return (accounts);
                        } else {
                            if (Array.isArray(accounts)) {
                                let promises = [];
                                const converter = new Converter(context);
                                for (let idx = 0; idx < accounts.length; idx++) {
                                    promises.push(converter.db2json(accounts[idx], converter.accountSchema));
                                }
                                if (promises.length > 0) {
                                    return Promise.all(promises)
                                } else {
                                    return errorParsing(context, {
                                        status_code: 404,
                                        status_message: 'no account found'
                                    })
                                }
                            } else {
                                return errorParsing(context, {
                                    status_code: 404,
                                    status_message: 'no account found'
                                })
                            }
                        }
                    } else {
                        return errorParsing(context, {status_code: 404, status_message: 'no account found'})
                    }
                })
                .then(result => {
                    if (result) {
                        if (result.status_code) {
                            if (overtake) {
                                logger.debug('error: %j', result);
                                return (result);
                            } else {
                                logger.error('error: %j', result);
                                return (result);
                            }
                        } else {
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

                        }
                    } else {
                        let error = errorParsing(context, {status_code: 4004, status_message: 'no result'})
                        if (overtake) {
                            logger.debug('error: %j', error);
                            return (error);
                        } else {
                            logger.error('error: %j', error);
                            return (error);
                        }
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    reject(errorParsing(context, error));
                });
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};
