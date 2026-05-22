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

'use strict';

import serverLogger from 'lib-server-logger';
import errorParsing from '../../utils/errorParsing.mjs';
import responseError from '../../utils/responseError.mjs';

import getAccount from '../../models/account/get.mjs';
import patchAccount from '../../models/account/patch.mjs';

const globalPrefix = '/controllers/account/patch.mjs';

export default function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        // let userInfo = request.userinfo;
        // logger.debug('userInfo: %j', userInfo);

        let id = request.params.id;
        logger.debug('id: %s', id);

        let token = request.params.token;
        logger.debug('token: %s', token);

        let newAccount;
        if (Object.keys(request.body).length > 0) newAccount = request.body;
        logger.debug('newAccount: %j', newAccount);

        if (newAccount) {
            // if (userInfo.admin || (id === userInfo.id)) {
            // if (newAccount.id) delete newAccount.id;
            // if (newAccount.token) delete newAccount.token;
            // logger.debug('newAccount: %j', newAccount);

            //recherche la présence du compte à modifier dans la base
            getAccount(context, {id: id}, 0, 0, false)
                .then(originalAccounts => {
                    logger.debug('originalAccounts: %j', originalAccounts);
                    if (originalAccounts.status_code) {
                        return (originalAccounts)
                    } else {
                        //une ou plusieurs correspondance trouve
                        let updateAccount;
                        if (Array.isArray(originalAccounts)) {
                            //si plusieurs correspondances, on prend la première réponse
                            logger.debug("originalAccounts is an array");
                            if (originalAccounts.length > 0) {
                                updateAccount = originalAccounts[0];
                            }
                        } else {
                            //une seule correspondance
                            updateAccount = originalAccounts;
                        }
                        if (updateAccount) {
                            //si document à mettre à jour
                            //remplacement des champs à modifier
                            for (let key in newAccount) {
                                logger.debug('key: %s', key);
                                updateAccount[key] = newAccount[key];
                            }
                            logger.debug('updateAccount: %j', updateAccount);
                            //mise à jour de la base
                            return patchAccount(context, id, updateAccount)
                        } else {
                            //erreur, pas de document à mettre à jour
                            let error = errorParsing(context, {
                                status_code: 404,
                                status_message: 'No account found'
                            });
                            logger.debug("originalAccounts is not an array");
                            return responseError(context, {status_code: 404});
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
            // } else {
            //     let error = errorParsing(context, {statusCode: 403})
            //     logger.error('error: %j', error);
            //     responseError(context, error, response, logger);
            // }
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
