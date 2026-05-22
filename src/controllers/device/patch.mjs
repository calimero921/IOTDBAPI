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

'use strict';

import serverLogger from 'lib-server-logger';
import errorParsing from '../../utils/errorParsing.mjs';
import responseError from '../../utils/responseError.mjs';

import getDevice from '../../models/device/get.mjs';
import patchDevice from '../../models/device/patch.mjs';

const globalPrefix = '/controller/device/patch.mjs';

export default function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        //let userInfo = request.userinfo;
        //logger.debug('userInfo: %sj', userInfo);

        let id = request.params.id;
        logger.debug('id: %s', id);

        let newDevice;
        if (Object.keys(request.body).length > 0) newDevice = request.body;
        logger.debug('newDevice: %j', newDevice);

        if (newDevice) {
            // if (userInfo.admin || (id === userInfo.id)) {
            // if (newAccount.id) delete newAccount.id;
            // if (newAccount.token) delete newAccount.token;
            // logger.debug('newAccount: %j', newAccount);
            
            getDevice(context, {id: id}, 0, 0, false)
                .then(originalDevices => {
                    logger.debug('originalDevices: %j', originalDevices);
                    if (originalDevices.status_code) {
                        return originalDevices;
                    } else {
                        let updateDevice;
                        if (Array.isArray(originalDevices)) {
                            // if (userInfo.admin || (originalDevices.user_id === userInfo.id)) {
                            if (originalDevices.length > 0) {
                                updateDevice = originalDevices[0];
                            }
                        } else {
                            updateDevice = originalDevices;
                        }
                        if (updateDevice) {
                            for (let key in newDevice) {
                                logger.debug('key: %s', key);
                                updateDevice[key] = newDevice[key];
                            }
                            return patchDevice(context, id, updateDevice);
                        } else {
                            logger.debug("originalDevices is not an array");
                            return responseError(context, {status_code: 404});
                        }
                    }
                })
                .then(patchedDevice => {
                    if (patchedDevice) {
                        if (patchedDevice.status_code) {
                            logger.error('error: %j', patchedDevice);
                            responseError(context, patchedDevice, response, logger);
                        } else {
                            logger.debug('result: %j', patchedDevice);
                            response.status(200).send(patchedDevice);
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
            // } else {
            //     let error = errorParsing(context, {statusCode: 403})
            //     logger.error('error: %j', error);
            //     responseError(context, error, response, logger);
            // }
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
