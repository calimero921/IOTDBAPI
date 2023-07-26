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
const Converter = require('./utils/Converter.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, query, offset, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/event/get.js',
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
        mongoFind(context, converter,'event', query, parameter, overtake)
            .then(datas => {
                // logger.object(datas, 'datas');
                if (datas.length > 0) {
                    resolve(datas);
                } else {
                    if (overtake) {
                        resolve(errorParsing(context, {status_code: 404}));
                        logger.debug('done - no result but ok');
                    } else {
                        reject(errorParsing(context, {status_code: 404}));
                        logger.debug('done - not found');
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
