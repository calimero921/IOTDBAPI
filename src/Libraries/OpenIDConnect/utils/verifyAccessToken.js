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

const {jwtVerify} = require('jose/jwt/verify');
const errorParsing = require('../utils/errorParsing.js');
const joseErrorParsing = require('../utils/joseErrorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/utils/verifyAccessToken.js';

module.exports = function (context, serverLogger, options, keystore, token) {
    let logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    })

    return new Promise((resolve, reject) => {
        try {
            logger.debug('token: %j', token);
            if (token) {
                if (token.split('.').length === 3) {
                    logger.debug('JWT token detected')
                    let validationAttributes = {
                        issuer: options.issuer,
                        audience: options.audience
                    }
                    logger.debug('validation attributes for token : %j', validationAttributes);

                    keystore.get(context)
                        .then(localKeystore => {
                            logger.debug('localKeystore: %O', typeof (localKeystore) != 'undefined');
                            return jwtVerify(token, localKeystore, validationAttributes);
                        })
                        .then(verifiedToken => {
                            logger.debug('verified token: %j', verifiedToken);
                            resolve(verifiedToken);
                        })
                        .catch(error => {
                            let errorJose = joseErrorParsing(context, serverLogger, error);
                            logger.debug('error: %j', error);
                            logger.debug('formatted error: %j', errorJose);
                            if (errorJose.status_code === 412) {
                                logger.debug('Try to update the keystore');
                                keystore.update(context)
                                    .then(updatedLocalKeystore => {
                                        logger.debug('Updated keystore into local memory : %O', updatedLocalKeystore);
                                        return jwtVerify(token, updatedLocalKeystore, validationAttributes);
                                    })
                                    .then(verifiedToken => {
                                        logger.debug('Verified Token : %j', verifiedToken);
                                        resolve(verifiedToken);
                                    })
                                    .catch(persistentError => {
                                        logger.error("persistent error: %j", persistentError);
                                        reject(errorParsing(context, {status_code: 403}));
                                    })
                            } else {
                                logger.error("no valid token provided");
                                reject(errorParsing(context, errorJose));
                            }
                        })
                } else {
                    logger.debug('opaque token returned as is')
                    resolve(token);
                }
            } else {
                logger.error("no valid token provided");
                reject(errorParsing(context, {status_code: 401}));
            }
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
}