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

const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');

const DecodeResponse = require('../utils/decodeResponse.js');
const errorParsing = require('../utils/errorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/baseapi/request.js';

module.exports = function (context, serverLogger, options, data) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('options: %j', options);
            logger.debug('data: %s', data);

            if (!options) {
                resolve(errorParsing(context, 'Missing options'));
            } else {
                let callReturn = "";
                if (options.https_proxy && options.https_proxy !== "") {
                    if (!options.https_proxy.startsWith('http')) {
                        options.https_proxy = `http://${options.https_proxy}`
                    }
                    logger.debug('https_proxy: %s', options.https_proxy);
                    options.agent = new HttpsProxyAgent(options.https_proxy);
                    delete options.https_proxy;
                }
                logger.debug('options: %j', options);
                const request = https.request(options, (response) => {
                    try {
                        logger.debug('response.statuscode: %s', response.statusCode);
                        logger.debug('response.headers: %j', response.headers);
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject(errorParsing(context, {status_code: response.statusCode}));
                        } else {
                            response.setEncoding('utf8');
                            response.on('data', (chunk) => {
                                if (chunk) {
                                    logger.debug('chunk: %j', chunk);
                                    if (!callReturn) {
                                        callReturn = ""
                                    }
                                    callReturn = callReturn + chunk;
                                } else {
                                    logger.debug('empty chunk');
                                }
                            });
                            response.on('end', () => {
                                if (!callReturn) {
                                    logger.debug('no response');
                                    resolve(errorParsing(context, {status_code: response.statusCode,}));
                                } else {
                                    logger.debug('callReturn: %j', callReturn);
                                    const decodeResponse = new DecodeResponse(context, serverLogger);
                                    const responseContent = decodeResponse.decode(callReturn);
                                    logger.debug("response code: %j", responseContent.code);
                                    if (responseContent.error) {
                                        logger.debug('error: %j', responseContent.error);
                                        if (responseContent.error.code === '200') {
                                            //le champ code est présent mais à 200 => réponse correcte
                                            logger.debug('response 200-OK');
                                            delete responseContent.error;
                                            resolve(responseContent);
                                        } else {
                                            logger.error('error: %j', callReturn);
                                            reject(responseContent.error);
                                        }
                                    } else {
                                        logger.debug('return decoded response');
                                        resolve(responseContent);
                                    }
                                }
                            });
                        }
                    } catch (exception) {
                        logger.error('exception: %s', exception.stack);
                        reject(errorParsing(context, exception));
                    }
                });

                request.on('error', error => {
                    if (error.code === 'ECONNRESET') {
                        logger.debug('error: %j', error);
                        resolve(errorParsing(context, {status_code: 500, status_message: error}));
                    } else {
                        logger.error('error: %j', error);
                        reject(errorParsing(context, {status_code: 503, status_message: error}));
                    }
                });

                if (data) {
                    request.write(data)
                }

                request.end();
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};

