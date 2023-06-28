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

const request = require('./request.js');

const errorParsing = require('../utils/errorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/baseapi/get.js';

module.exports = function (context, serverLogger, options, apiPath, headers, params) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('apiPath: %j', apiPath);
            let requestOptions = {
                host: options.hostname,
                port: options.port,
                method: 'GET',
                path: apiPath,
                headers: {
                    'Accept': 'application/json'
                },
                https_proxy: options.https_proxy,
                rejectUnauthorized: false
            };

            if (headers) {
                for (const header of Object.keys(headers)) {
                    requestOptions.headers[header] = headers[header];
                }
            }

            if (params) {
                requestOptions.path += '?'
                Object.keys(params).forEach(key => {
                    if (query.length > 1) {
                        requestOptions.path += '&';
                    }
                    requestOptions.path += `${key}=${params[key]}`
                })
                logger.debug('requestOptions.path: %j', requestOptions.path);
            }

            request(context, serverLogger, requestOptions)
                .then(response => {
                    logger.debug('response: %j', response);
                    try {
                        resolve(JSON.parse(response));
                    } catch (exception) {
                        logger.debug('raw response');
                        resolve(response);
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    reject(errorParsing(context, error));
                })
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
}
