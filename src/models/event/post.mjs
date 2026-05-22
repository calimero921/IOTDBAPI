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

import mongoInsert from '../../Libraries/MongoDB/insert.mjs';
import Converter from '../utils/Converter.mjs';

export default function (context, event) {
    const logger = serverLogger.child({
        source: '/models/event/post.mjs',
        httpRequestId: context.httpRequestId
    });

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('storing event');
            const converter = new Converter(context);
            if (typeof event === 'undefined') {
                reject(errorParsing({status_code: 400, status_message: 'Missing parameter'}));
                logger.log('done - missing parameter');
            } else {
                logger.debug('preparing datas');
                converter.json2db(event, converter.eventSchema)
                    .then(query => {
                        //ajout des informations générées par le serveur
                        logger.debug('query: %s', query);
                        return mongoInsert(context, 'event', query);
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas === 'undefined') {
                            logger.debug('done - no data');
                            return (errorParsing(context, 'No datas'));
                        } else {
                            return converter.db2json(datas[0], converter.eventSchema);
                        }
                    })
                    .then(datas => {
                        //logger.debug('datas: %s', datas);
                        if (typeof datas === 'undefined') {
                            reject(errorParsing(context, 'No datas'));
                            logger.debug('done - no data');
                        } else {
                            if (typeof datas.status_code === "undefined") {
                                resolve(datas);
                                logger.debug('done - ok');
                            } else {
                                reject(datas);
                                logger.debug('done - wrong data');
                            }
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    });
            }
        } catch (error) {
            logger.error('error: %j', error);
            reject(error);
        }
    });
};