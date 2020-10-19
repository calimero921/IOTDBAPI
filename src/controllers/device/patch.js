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

const deviceGet = require('../../models/device/get.js');
const devicePatch = require('../../models/device/patch.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route PATCH /v0/device/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {Device.model} device.body.required - Device details
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/routes/api/device/devicePatch.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %sj', userInfo);

        let device_id = request.params.id;
        logger.debug('device id: %s', device_id);

        if (device_id && request.body) {
            let newData = request.body;
            logger.debug('newData: %j', newData);
            deviceGet(context, {device_id: device_id}, 0, 0, false)
                .then(oldDevices => {
                    logger.debug('oldDevices: %j', oldDevices);
                    if (oldDevices) {
                        if (oldDevices.status_code) {
                            return oldDevices;
                        } else {
                            if (userInfo.admin || (oldDevices.user_id === userInfo.id)) {
                                if (oldDevices.length > 0) {
                                    return devicePatch(context, oldDevices[0].device_id, newData);
                                } else {
                                    let error = errorParsing(context, {status_code: 404,status_message:'No device found'});
                                    logger.error('error: %j', error);
                                    return error;
                                }
                            } else {
                                let error = errorParsing(context, {status_code: 403, status_message:'User not admin nor owner of device'});
                                logger.error('error: %j', error);
                                return error;
                            }
                        }
                    } else {
                        let error = errorParsing(context, 'No device found');
                        logger.error('error: %j', error);
                        return error;
                    }
                })
                .then(result => {
                    if (result) {
                        if (result.status_code) {
                            logger.error('error: %j', result);
                            responseError(context, result, response, logger);
                        } else {
                            logger.debug('result: %j', result);
                            response.status(200).send(result);
                        }
                    } else {
                        let error = errorParsing(context, 'No result');
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'Missing parameters'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
