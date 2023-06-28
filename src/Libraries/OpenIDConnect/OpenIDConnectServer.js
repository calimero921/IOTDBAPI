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

const Keystore = require('./utils/Keystore.js');

const apiStatus = require('./api/status.js');
const checkAccessToken = require('./api/checkAccessTokenMiddleware.js');
const validateScopes = require('./utils/validateScopes.js');
const logout = require('./api/logout.js');

const responseError = require('./utils/responseError.js');

const globalPrefix = '/Libraries/OpenIDConnect/OpenIDConnectServer.js';

class OidcServer {
    constructor() {
        this.apiStatus = false;
    }

    initialize(options, server_logger, server) {
        this.apiStatus = true;
        this.options = options;
        this.serverLogger = server_logger;

        this.keystore = new Keystore(this.options, this.serverLogger);

        const context = {
            httpRequestId: 'initialize',
            authorizedClient: 'internal'
        }
        const logger = this.serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        logger.debug('this.options: %j', this.options);
        logger.debug('initialized');

        server.use(checkAccessToken(this.options, this.serverLogger, this.keystore));
    }

    protect(...allowedScopes) {
        return (request, response, next) => {
            let context = {
                httpRequestId: request.httpRequestId,
                authorizedClient: 'initialization'
            };

            let localPath = request.path.split('/');
            localPath.splice(0,2);
            localPath.splice(2);
            let pathName = `/${localPath.join('/')}/`;
            const KPI = {
                source: globalPrefix,
                name: pathName,
                verb: request.method.toLowerCase(),
                cuid: 'none'
            };
            if (request.accessToken) {
                context.authorizedClient = request.accessToken.sub
            }
            let logger = this.serverLogger.child({
                source: globalPrefix + ':protect',
                httpRequestId: context.httpRequestId,
                authorizedClient: context.authorizedClient
            });

            logger.debug('start the protected');

            let error = validateScopes(context, this.serverLogger, allowedScopes, request, 'server');

            if(error){
                responseError(context, error, response, logger);
            } else {
                next();
            }
        }
    }

    status(context) {
        return apiStatus(context, this.serverLogger, this.options);
    }

    logout(context, request, response) {
        return logout(context, this.serverLogger, this.options, request, response);
    }
}

module.exports = new OidcServer();
