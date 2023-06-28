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

const mongoDelete = require('../../Libraries/MongoDB/api/deleteall.js');

const serverLogger = require('../../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, device_id) {
    const logger = serverLogger.child({
        source: '/models/device/delete.js',
        httpRequestId: context.httpRequestId
    });

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        let query = {};
        if (typeof device_id === 'undefined') {
            reject(errorParsing(context, {status_code: 400}));
            logger.debug('done - missing paramater');
        } else {
            query.device_id = device_id;
            mongoDelete(context, 'event', query)
                .then(datas => {
                    // logger.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        reject(errorParsing(context, {status_code: 500}));
                        logger.debug('done - no reult');
                    } else {
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            logger.debug('done - ok');
                        } else {
                            reject(errorParsing(context, datas));
                            logger.debug('done - response error');
                        }
                    }
                })
                .catch(error => {
                    logger.object(error, 'error');
                    reject(errorParsing(context, error));
                    logger.debug('done - promise catch')
                });
        }
    });
};
