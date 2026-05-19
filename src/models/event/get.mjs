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
import errorParsing from '../../utils/errorParsing.mjs';

import mongoFind from '../../Libraries/MongoDB/find.mjs';
import Converter from '../utils/Converter.mjs';

export default function (context, query, offset, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/event/get.mjs',
        httpRequestId: context.httpRequestId
    });

    logger.object(query, 'query');
    logger.object(offset, 'offset');
    logger.object(limit, 'limit');
    logger.object(overtake, 'overtake');

    // if (typeof sort === 'undefined') sort = {};
    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        const converter = new Converter(context);
        let parameter = {sort:{store_date:-1}};
        if (typeof limit !== 'undefined') parameter.limit = limit;
        if (typeof offset !== 'undefined') parameter.offset = offset;
        mongoFind(context, 'event', query, parameter, overtake)
            .then(events => {
                if (events) {
                    if (events.status_code) {
                        return (events);
                    } else {
                        if (Array.isArray(events)) {
                            let promises = [];
                            const converter = new Converter(context);
                            for (let idx = 0; idx < events.length; idx++) {
                                promises.push(converter.db2json(events[idx], converter.eventSchema));
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
                logger.debug('done - global catch');
                logger.object(error, 'error');
                reject(errorParsing(context, error));
            });
    });
};
