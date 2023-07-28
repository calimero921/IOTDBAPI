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
 * @route DELETE /account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @returns {Error} 204
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */

'use strict';

const deleteAccount = require('../../models/account/delete.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/controllers/account/delete.js',
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

        // if (userInfo.admin || (id === userInfo.id)) {
            deleteAccount(context, id)
                .then(deletedAccount => {
                    logger.debug('deleted accounts: %j', deletedAccount);
                    logger.info('account deleted for id %s', deletedAccount.id);
                    response.status(204).send(deletedAccount);
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    responseError(context, error, response, logger);
                });
        // } else {
        //     let error = errorParsing(context, {
        //         status_code: 403,
        //         status_message: 'user must be admin or account owner for this action'
        //     });
        //     logger.error('error : %j', error);
        //     responseError(context, error, response, logger);
        // }
    } catch (exception) {
        logger.debug('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};