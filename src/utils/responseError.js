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

const serverLogger = require('../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('./errorParsing.js');

module.exports = function (context, content, response, sourcelogger) {
    const logger = serverLogger.child({
        source: '/utils/responseError.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.debug('content: %j', content);
    let finalContent = errorParsing(context, content, true);

    let message = 'code: ';
    message += finalContent.status_code;

    if (typeof finalContent.status_message !== 'undefined') {
        message += ' / message: ' + finalContent.status_message;
    }

    sourcelogger.error('%j', message);
    response.status(finalContent.status_code).send(finalContent.status_message);
};