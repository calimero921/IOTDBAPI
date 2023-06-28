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

const Wellknown = require('../utils/Wellknown.js');
const errorParsing = require('../utils/errorParsing.js');
const responseError = require("../utils/responseError");

const globalPrefix = '/Libraries/OpenIDConnect/api/logout.js';

module.exports = function (context, serverLogger, options, oidc, request, response) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    let localPath = request.path.split('/');
    localPath.splice(0, 2);
    localPath.splice(2);
    let pathName = `/${localPath.join('/')}/`;
    const KPI = {
        source: globalPrefix,
        name: pathName,
        verb: request.method.toLowerCase(),
        cuid: 'none'
    };

    try {
        const wellknown = new Wellknown(options, serverLogger);
        wellknown.get(context)
            .then(wellknownContent => {
                let redirectUrl = wellknownContent.end_session_endpoint;

                logger.debug('oidc: %o', oidc);
                let params = {
                    id_token_hint: oidc.id_token,
                    post_logout_redirect_uri: options.post_logout_redirect_uri
                }
                logger.debug('params: %j', params);
                let query = '';
                Object.keys(params).forEach(key => {
                    if (query.length > 1) {
                        query += '&';
                    }
                    query += `${key}=${params[key]}`
                })
                logger.debug('query: %j', query);

                if (query.length > 0) {
                    redirectUrl += `?${query}`
                }
                logger.debug('redirectUrl: %j', redirectUrl);

                response.redirect(redirectUrl);
                const status = {status_code: 302};
                kpiLogger(context, serverLogger, KPI, status);
            })
            .catch(error => {
                logger.error('error : %j', error);
                responseError(context, error, response, logger);
            })
    } catch (exception) {
        logger.debug('exception: %s', exception.stack);
        const status = errorParsing(context, exception);
        responseError(context, status, response, logger);
    }
}
