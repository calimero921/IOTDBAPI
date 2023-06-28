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

const mongoDelete = require('../../Libraries/MongoDB/api/delete.js');

const serverLogger = require('../../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, device_id) {
    const logger = serverLogger.child({
        source: '/models/device/delete.js',
        httpRequestId: context.httpRequestId
    });

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('device_id: %s', device_id);
            let query = {};
            if (device_id) {
                query.device_id = device_id;
                mongoDelete(context, 'device', query)
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                logger.error('error: %j', datas);
                                reject(datas);
                            } else {
                                resolve(datas);
                            }
                        } else {
                            let error = errorParsing(context, 'No result');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(error);
                    });
            } else {
                let error = errorParsing(context, {status_code: 400, status_message: 'Missing device ID'});
                logger.error('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};
