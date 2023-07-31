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
 * @route GET /account/email/{email}
 * @group Account - Operations about account
 * @param {string} email.path.required - eg: emmanuel.david@orange.com
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

const globalPrefix = '/controllers/account/getByEmail.js';

module.exports = function (request, response) {
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

        let email = request.params.email;
        logger.debug('email: %s', email);

        let filter = {email: email};
        // if (!userInfo.admin) filter.id = userInfo.id;
        // logger.debug('filter: %s', filter);

        let skip = request.query.skip;
        if (!skip) skip = 0;
        logger.debug('skip: %s', skip);

        let limit = request.query.limit;
        if (!limit) limit = 0;
        logger.debug('limit: %s', limit);

        //traitement de recherche dans la base
        getAccount(context, filter, skip, limit, false)
            .then(accounts => {
                logger.debug('account(s): %j', accounts);
                logger.info('account(s) found for email %j', filter.email);
                response.status(200).send(accounts);
            })
            .catch(error => {
                logger.error('error: %j', error);
                responseError(context, error, response, logger);
            });
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};