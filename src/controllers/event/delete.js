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

const remove = require('../../models/event/delete.js');

const checkAuth = require('server-logger');;
const {serverLogger} = require('server-logger');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route DELETE /v0/event/{device_id}
 * @group Measure - Operations about measure
 * @param {string} device_id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Error} 204
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
        source: '/controllers/event/delete.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        logger.debug('id: %j', request.params.id);
        let device_id = request.params.id;

        //traitement de recherche dans la base
        if (device_id) {
            //traitement de suppression dans la base
            remove(context, device_id)
                .then(removedData => {
                    logger.debug('removedData: %j', removedData);
                    if (removedData) {
                        if (removedData.status_code) {
                            logger.error('error: %j', removedData);
                            responseError(context, removedData, response, logger);
                        } else {
                            logger.debug('removedData: %j', removedData);
                            response.status(204).send();
                        }
                    } else {
                        responseError(context, {status_code: 404}, response, logger);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            //aucun id
            logger.error('missing parameter');
            responseError(context, {status_code: 400}, response, logger);
        }
    } catch (exception) {
        logger.error(exception.stack);
        if (exception.message === "403") {
            responseError(context, {status_code: 403}, response, logger);
        } else {
            responseError(context, exception, response, logger);
        }
    }
};