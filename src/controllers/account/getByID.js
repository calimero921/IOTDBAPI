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
 * @route GET /account/id/{id}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Account.model} 200 - User info
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */

'use strict';

const getAccount = require('../../models/account/get.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/controllers/account/getById.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let id = request.params.id;
        logger.debug('id: %s', id);

        let filter = {id: id};
        logger.debug('filter: %s', filter);

        // if (userInfo.admin || id === userInfo.id) {
            //traitement de recherche dans la base
            getAccount(context, filter, 0, 0, false)
                .then(accounts => {
                    logger.debug('account(s): %j', accounts);
                    logger.info('account(s) found for id %s', filter.id);
                    response.status(200).send(accounts[0]);
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    responseError(context, error, response, logger);
                });
        // } else {
        //     let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'});
        //     logger.debug('error: %j', error);
        //     responseError(context, error, response, logger);
        // }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
