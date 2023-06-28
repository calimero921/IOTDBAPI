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

const errorParsing = require('./errorParsing.js');

module.exports = function (context, content, response, sourceLogger) {
    if (content.stack) {
        sourceLogger.error('error: %s', content.stack)
    }

    sourceLogger.error('error: %j', content);
    const error = errorParsing(context, content, true);
    response.status(error.status_code).send(error.status_message);
}
