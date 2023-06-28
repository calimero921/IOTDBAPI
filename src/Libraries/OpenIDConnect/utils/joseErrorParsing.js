/**
 * Orange DIOD
 * OIDC Connector library
 *
 * Copyright (C) 2021 Orange
 *
 * This software is confidential and proprietary information of Orange.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * If you are Orange employee you shall use this software in accordance with
 * the Orange Source Charter (http://opensource.itn.ftgroup/index.php/Orange_Source).
 *
 * @author SOFT Pessac
 */

'use strict';

const errorParsing = require('./errorParsing');

const globalPrefix = 'OIDC Connector:/utils/joseErrorParsing.js';

module.exports = function (context, serverLogger, error) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        logger.debug('error: %j', error);
        let result;
        if (error) {
            if (error.name) {
                switch (error.name) {
                    case 'JWTInvalid':
                    case 'JWTExpired':
                    case 'JWTClaimValidationFailed':
                    case 'JWSSignatureVerificationFailed':
                    case 'JWKSInvalid':
                    case 'JWSInvalid':
                        result = errorParsing(context, {status_code: 403});
                        break;
                    case 'JWKSNoMatchingKey':
                        result = errorParsing(context, {status_code: 412, status_message: 'no matching key'});
                        break;
                    default:
                        result = errorParsing(context, {status_code: 500, status_message: error.name});
                        break;
                }
            } else {
                if (error.status_code || error.status_message) {
                    logger.debug('error already formatted');
                    result = error;
                } else {
                    if (typeof error === 'string') {
                        result = errorParsing(context, error);
                    } else {
                        result = errorParsing(context, 'message with empty or null value');
                    }
                }
            }
        } else {
            result = errorParsing(context, 'missing or empty error');
        }
        logger.debug('result: %j', result);
        return result;
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        return errorParsing(context, exception);
    }
}