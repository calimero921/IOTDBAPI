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

const HttpsProxyAgent = require('https-proxy-agent');
const {createRemoteJWKSet} = require('jose/jwks/remote');
const Wellknown = require('./Wellknown.js')

const errorParsing = require('../utils/errorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/utils/Keystore.js';

class Keystore {
    constructor(options, server_logger) {
        this.options = options;
        this.serverLogger = server_logger;

        const context = {
            httpRequestId: 'initialize',
            authorizedClient: 'internal'
        }

        let logger = this.serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        this.keystore = undefined;
        this.wellknown = new Wellknown(this.options, this.serverLogger);
        logger.debug('Keystore created');
    }

    get(context) {
        let logger = this.serverLogger.child({
            source: globalPrefix + ':get',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('Getting keystore');
                if (this.keystore) {
                    logger.debug('use in memory keystore');
                    resolve(this.keystore)
                } else {
                    logger.debug('load keystore from server');
                    this.update(context)
                        .then(keystoreResponse => {
                            resolve(keystoreResponse);
                        })
                        .catch(error => {
                            logger.error('error: %j', error);
                            reject(errorParsing(context, error));
                        })
                }
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(exception);
            }
        });
    }

    update(context) {
        let logger = this.serverLogger.child({
            source: globalPrefix + ':update',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            // try {
                logger.debug('Updating keystore');
                this.wellknown.get(context)
                    .then(wellknownResponse => {
                        logger.debug('wellknownResponse: %j', wellknownResponse);
                        if (wellknownResponse.hasOwnProperty('jwks_uri')) {
                            const jwksUrl = new URL(wellknownResponse.jwks_uri);
                            logger.debug('jwksUrl: %j', jwksUrl);

                            logger.debug('options: %j', this.options);
                            let agentsOptions = {}
                            if (this.options.https_proxy && this.options.https_proxy !== "") {
                                if (!this.options.https_proxy.startsWith('http')) {
                                    this.options.https_proxy = `http://${this.options.https_proxy}`
                                }
                                logger.debug('https_proxy: %s', this.options.https_proxy);
                                agentsOptions.agent = new HttpsProxyAgent(this.options.https_proxy);
                            }
                            logger.debug('agentsOptions: %j', agentsOptions);
                            this.keystore = createRemoteJWKSet(jwksUrl, agentsOptions);
                            logger.debug('this.keystore: %s', typeof (this.keystore)!='undefined');
                            resolve(this.keystore);
                        } else {
                            const error = errorParsing(context, 'missing jwks_uri in wellknown')
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(errorParsing(context, error));
                    })
            // } catch (exception) {
            //     logger.error('exception: %s', exception.stack);
            //     reject(exception);
            // }
        });
    }
}

module.exports = Keystore;