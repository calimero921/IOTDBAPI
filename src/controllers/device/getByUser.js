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
 * @route GET /device/user/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - user id - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {number} skip.query - Record to skip
 * @param {number} limit.query - Nb record to show
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */

'use strict';

const deviceGet = require('../../models/device/get.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

const globalPrefix = '/controllers/device/getByUser.js';

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
        logger.debug('userInfo: %sj', userInfo);

        let id = request.params.id;
        logger.debug('user id: %s', id);
        let skip = request.query.skip;
        if (!skip) skip = 0;
        logger.debug('skip: %s', skip);
        let limit = request.query.limit;
        if (!limit) limit = 0;
        logger.debug('limit: %s', limit);

        //traitement de recherche dans la base
        if (id) {
            // if (userInfo.admin || id === userInfo.id) {
                let filter = {user_id: id};
                deviceGet(context, filter, skip, limit, false)
                    .then(devices => {
                        if (devices) {
                            if (devices.status_code) {
                                logger.error('error: %j', devices);
                                responseError(context, devices, response, logger);
                            } else {
                                logger.debug('devices: %j', devices);
                                response.status(200).send(devices);
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
            //     let error = errorParsing(context, {
            //         status_code: 403,
            //         status_message: 'User must be admin or search for his own device'
            //     });
            //     logger.error('error: %j', error);
            //     responseError(context, error, response, logger);
            // }
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing ID'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
