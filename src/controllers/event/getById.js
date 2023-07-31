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
 * @route GET /v0/event/{device_id}
 * @group Measure - Operations about measure
 * @param {string} device_id.path.required - eg: 778cdaa0-869c-11e8-a13c-0d1008100710
 * @returns {array.<Measure>} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */

'use strict';

const deviceGet = require('../../models/device/get.js');
const measureGet = require('../../models/event/get.js');

const checkAuth = require('server-logger');
const {serverLogger} = require('server-logger');
const responseError = require('../../utils/responseError.js');

const globalPrefix = '/controllers/event/getById.js';

module.exports = function (request, response) {
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
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        logger.debug('id: %j', request.params.id);
        let device_id = request.params.id;

        //traitement de recherche dans la base
        if (typeof device_id === 'undefined') {
            let query = {device_id: device_id};
            //traitement de recherche dans la base
            deviceGet(context, query, 0, 0)
                .then(device => {
                    if (device) {
                        if (device.status_code) {
                            return device;
                        } else {
                            return measureGet(context, query, 0, 100);
                        }
                    } else {
                        return {status_code: 404};
                    }
                })
                .then(measure => {
                    if (measure) {
                        if (measure.status_code) {
                            logger.error('error: %j', measure);
                            responseError(context, measure, response, logger);
                        } else {
                            logger.debug('measure: %j', measure);
                            response.status(200).send(measure);
                        }
                    } else {
                        logger.error('error: measure not found');
                        responseError(context, {status_code: 404}, response, logger);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            //aucun device_id
            logger.error('error: missing parameter');
            responseError(context, {status_code: 400}, response, logger);
        }
    } catch (exception) {
        logger.error(exception.stack);
        if (exception.message === "403") {
            responseError(context, {status_code: 403}, response, logger);
        } else {
            responseError(context, exception, response, logger);
        }
    }
};
