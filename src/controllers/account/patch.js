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

const patchAccount = require('../../models/account/patch.js');
const getAccount = require('../../models/account/get.js');

const serverLogger = require('../../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route PATCH /account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @param {Account.model} account.body.required - User details
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/controllers/account/patch.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        let id = request.params.id;
        logger.debug('id: %s', id);
        let token = request.params.token;
        logger.debug('token: %s', token);
        let requestBody;
        if (Object.keys(request.body).length > 0) requestBody = request.body;
        logger.debug('requestBody: %j', requestBody);

        if (requestBody) {
            if (userInfo.admin || (id === userInfo.id)) {
                if (requestBody.id) delete requestBody.id;
                if (requestBody.token) delete requestBody.token;
                logger.debug('requestBody: %j', requestBody);

                getAccount(context, {id: id}, 0, 0, false)
                    .then(accounts => {
                        logger.debug('accounts: %j', accounts);
                        if (accounts.status_code) {
                            return (accounts)
                        } else {
                            let newAccount = accounts[0];
                            if (newAccount) {
                                for (let key in requestBody) {
                                    logger.debug('key: %s', key);
                                    newAccount[key] = requestBody[key];
                                }
                                logger.debug('newAccount: %j', newAccount);
                                return patchAccount(context, id, token, newAccount)
                            } else {
                                return {status_code: 404};
                            }
                        }
                    })
                    .then(patchedAccount => {
                        logger.debug('patchedAccount: %j', patchedAccount);
                        if (patchedAccount.status_code) {
                            responseError(context, patchedAccount, response, logger);
                        } else {
                            logger.debug('account patched for id %s', patchedAccount.id);
                            response.status(200).send(patchedAccount);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    })
            } else {
                let error = errorParsing(context, {statusCode: 403})
                logger.error('error: %j', error);
                responseError(context, error, response, logger);
            }
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing parameters'})
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
