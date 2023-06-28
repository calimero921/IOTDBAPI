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

const errorParsing = require('../utils/errorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/utils/validateScopes.js';

module.exports = function (context, serverLogger, allowedScopes, request, sideMode) {
    let logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    let payload;
    let error;

    logger.debug('allowedScopes: %j', allowedScopes);
    logger.debug('sideMode: %j', sideMode);

    switch (sideMode) {
        case 'client':
            if (request.session.oidc.access_token) {
                let encodedPayload = request.session.oidc.access_token.split('.')[1];
                let decodedPayload = Buffer.from(encodedPayload, 'base64').toString('utf-8');
                payload = JSON.parse(decodedPayload);

                context.authorizedClient = payload.sub
            }
            break;
        case 'server':
            logger.debug('oidcError: %j', request.oidcError);
            logger.debug('accessToken: %j', request.accessToken);
            if (request.oidcError) {
                error = errorParsing(context, request.oidcError);
            } else {
                if (request.accessToken) {
                    payload = request.accessToken;
                }
            }
            break;
        default:
            break;
    }

    logger.debug('token payload: %j', payload);
    logger.debug('token error: %j', error);
    if (payload) {
        let found = false;
        if (payload.scope && typeof payload.scope === 'string') {
            let tokenScopes = payload.scope.split(' ');
            logger.debug('tokenScopes: %j', tokenScopes);

            found = findScopes(allowedScopes, tokenScopes);
            logger.debug('found: %j', found);
        }

        if (!found) {
            logger.error('error: no allowed scope');
            error = errorParsing(context, {status_code: 403});
        }
    } else {
        if(!error) {
            logger.error('error: no token');
            error = errorParsing(context, {status_code: 401});
        }
    }
    return error;
}

function findScopes(authorizedScopes, requestedScopes) {
    let found = false;
    for (const authorizedScope of authorizedScopes) {
        for (const requestedScope of requestedScopes) {
            if (requestedScope === authorizedScope) {
                found = true;
            }
        }
    }
    return found;
}