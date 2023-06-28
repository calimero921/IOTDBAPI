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

const deviceSet = require('../../models/device/set.js');
const deviceGet = require('../../models/device/get.js');

const serverLogger = require('../../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route POST /v0/device
 * @group Device - Operations about device
 * @param {Device.model} device.body.required - Device details
 * @returns {Device.model} 201 - Device info
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/routes/api/device/post.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        if (request.body) {
            //lecture des données postées
            let postData = request.body;
            logger.debug('postData: %j', postData);

            if (userInfo.admin || userInfo.id === postData.user_id) {
                let query = {
                    manufacturer: postData.manufacturer,
                    model: postData.model,
                    serial: postData.serial,
                    secret: postData.secret
                };
                deviceGet(context, query, 0, 0, true)
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                if (datas.status_code === 404) {
                                    if (!postData.user_id) postData.user_id = userInfo.id;
                                    return deviceSet(context, postData);
                                } else {
                                    return datas;
                                }
                            } else {
                                //le device est déjà présent
                                return {status_code: 409};
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return {status_code: 500, status_message: 'No datas'};
                        }
                    })
                    .then(datas => {
                        logger.debug('deviceSet datas: %j', datas);
                        if (datas) {
                            //recherche d'un code erreur précédent
                            if (datas.status_code) {
                                //erreur dans le processus d'enregistrement de la notification
                                logger.debug('error: %j', datas);
                                responseError(context, datas, response, logger);
                            } else {
                                //notification enregistrée
                                response.status(201).send(datas);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            let error = errorParsing(context, 'No data');
                            logger.error('error: %j', error);
                            responseError(context, error, response, logger);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    });
            } else {
                let error = errorParsing(context, {status_code: 403, status_message: 'User not admin nor owner of device'});
                logger.error('error: %j', error);
                responseError(context, error, response, logger);
            }
        } else {
            //aucune donnée postée
            let error = errorParsing(context, {status_code: 400, status_message: 'Missing body'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
