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

const mongoInsert = require('../../Libraries/MongoDB/api/insert.js');
const Converter = require('./utils/Converter.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, event) {
    const logger = serverLogger.child({
        source: '/models/event/set.js',
        httpRequestId: context.httpRequestId
    });

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('storing device');
            const converter = new Converter(context);
            if (typeof event === 'undefined') {
                reject(errorParsing({status_code: 400, status_message: 'Missing parameter'}));
                logger.log('done - missing parameter');
            } else {
                logger.debug('preparing datas');
                converter.json2db(event)
                    .then(query => {
                        //ajout des informations générées par le serveur
                        logger.object(query, 'query');
                        return mongoInsert(context, 'event', query);
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas === 'undefined') {
                            logger.debug('done - no data');
                            return (errorParsing(context, 'No datas'));
                        } else {
                            return converter.db2json(datas[0]);
                        }
                    })
                    .then(datas => {
                        // logger.object(datas, 'datas');
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
                        logger.object(error, 'error');
                        reject(errorParsing(context, error));
                        logger.debug('done - promise catch');
                    });
            }
        } catch (error) {
            logger.object(error, 'error');
            reject(errorParsing(context, error));
            logger.debug('done - global catch');
        }
    });
};