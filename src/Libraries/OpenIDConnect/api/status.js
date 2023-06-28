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

const apiGet = require('../baseapi/get.js');

const globalPrefix = '/Libraries/OpenIDConnect/api/Status.js';

module.exports = function (context, serverLogger, options) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve) => {
        logger.debug('Getting OIDC status');
        let result = {
            name: 'OIDC',
            version: '',
            status: true
        };

        apiGet(context, serverLogger, options, options.routes.status)
            .then(response => {
                logger.debug('response: %j', response);
                if (response.version) {
                    result.version = response.version;
                } else {
                    result.version = 'bypass';
                }
                if (typeof response.status === 'undefined') {
                    result.status = true;
                } else {
                    result.status = response.status;
                }
                resolve(result);
            })
            .catch(error => {
                logger.error('error: %j', error);
                if (error.status_code === 404) {
                    result.version = 'bypass';
                    result.status = true;
                } else {
                    result.tatus = false;
                }
                logger.debug('result: %j', result);
                resolve(result);
            })
    });
}
