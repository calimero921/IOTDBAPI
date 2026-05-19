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
 * @route DELETE /v0/device/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Error} 204
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */

'use strict';

import serverLogger from 'lib-server-logger';
import errorParsing from '../../utils/errorParsing.mjs';
import responseError from '../../utils/responseError.mjs';

import deleteDevice from '../../models/device/delete.mjs';

const globalPrefix = '/controllers/de ice/delete.mjs';

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
        let id = request.params.id;
        logger.debug('device id: %s', id);

        //traitement de recherche dans la base
        if (id) {
            deleteDevice(context, id)
                .then(result => {
                    if (result) {
                        if (result.status_code) {
                            logger.error('error: %j', result);
                            responseError(context, result, response, logger);
                        } else {
                            logger.debug('result: %j', result);
                            response.status(204).send();
                        }
                    } else {
                        let error = errorParsing(context, 'No result');
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            //aucun id
            let error = errorParsing(context, {status_code: 400, status_message: 'Missing ID'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};