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

const verifyAccessToken = require('../utils/verifyAccessToken.js');
const errorParsing = require('../utils/errorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/api/checkAccessTokenMiddleware.js';

module.exports = function (options, serverLogger, keystore) {
    return (request, response, next) => {
        const context = {
            httpRequestId: request.httpRequestId,
            authorizedClient: 'initialization'
        };

        let logger = serverLogger.child({
            source: globalPrefix,
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        try {
            logger.debug('getting Bearer from Authorization header');
            let bearer;
            if (request.headers) {
                if (request.headers.authorization) {
                    let authorization = request.headers.authorization.split(' ');
                    logger.debug('authorization: %s', authorization);

                    if (authorization.length > 1) {
                        if (authorization[0] === 'Bearer') {
                            bearer = authorization[1];
                        }
                    }
                }
            }
            logger.debug('bearer: %j', bearer);

            if (bearer) {
                let claims = {
                    issuer: options.issuer,
                    audience: options.audience
                };

                verifyAccessToken(context, serverLogger, claims, keystore, bearer)
                    .then(verifiedToken => {
                        logger.debug('Verified Token : %j', verifiedToken);
                        if (verifiedToken && verifiedToken !== 'null') {
                            request.accessToken = verifiedToken.payload;
                            request.authorizedClient = verifiedToken.payload.sub;
                        }
                        next();
                    })
                    .catch(error => {
                        logger.error('error : %j', error);
                        request.oidcError = errorParsing(context, error);
                        next();
                    })
            } else {
                next();
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            next();
        }
    }
}