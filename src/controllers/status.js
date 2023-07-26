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

const configuration = require('../config/Configuration.js');
const {serverLogger} = require('server-logger');
const responseError = require('../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /status
 * @returns {object} 200 - Api status with version / date
 * @returns {Error}  default - Unexpected error
 */

module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    }
    const logger = serverLogger.child({
        source: '/controllers/status.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        // logger.debug(request.headers, 'headers');
        // logger.debug(request.path, 'path');
        // logger.debug(request.query, 'query');
        // logger.debug(request.params, 'params');
        // logger.debug(request.body, 'body');

        let result = {};
        result.swagger_version = configuration.server.swagger;
        logger.debug('result: %j', result);

        response.status(200).send(result);
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};