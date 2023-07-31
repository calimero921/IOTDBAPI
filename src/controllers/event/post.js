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
 * @route POST /v0/measure
 * @group Measure - Operations about measure
 * @param {Measure.model} measure.body.required - Device details
 * @returns {Measure.model} 201 - Device info
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */

 'use strict';

const getDevice = require('../../models/device/get.js');
const patchDevice = require('../../models/device/patch.js');
const setEvent = require('../../models/event/set.js');

const checkAuth = require('server-logger');;
const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

const globalPrefix = '/routes/api/event/post.js';

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
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        if (request.body) {
            //lecture des données postées
            let postData = request.body;
            logger.debug('postData: %j', postData);
            let device;

            //lecture des données postées
            if (userInfo.admin || userInfo.id === postData.user_id) {
                let query = {device_id: postData.device_id};
                getDevice(context, query, 0, 0, true)
                    .then(devices => {
                        logger.debug('Device: %j', devices);
                        if (devices) {
                            if (devices.status_code) {
                                return devices;
                            } else {
                                device = devices[0];
                                return setEvent(context, postData);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return errorParsing(context, 'Device not found');
                        }
                    })
                    .then(event => {
                        logger.debug('event: %j', event);
                        if (event) {
                            if (event.status_code) {
                                return event;
                            } else {
                                postData = event;
                                return updateDevice(context, device, postData);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return errorParsing(context, 'No event');
                        }
                    })
                    .then(datas => {
                        // logger.debug(datas, 'setEvent measure');
                        if (datas) {
                            if (datas.status_code) {
                                return datas;
                            } else {
                                return patchDevice(context, postData.device_id, datas);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return errorParsing(context,{status_code: 500, status_message: 'No datas'});
                        }
                    })
                    .then(datas => {
                        // logger.debug(datas, 'updateDevice device');
                        if (datas) {
                            //recherche d'un code erreur précédent
                            if (datas.status_code) {
                                //erreur dans le processus d'enregistrement de la notification
                                logger.debug('error: %j', datas);
                                responseError(context, datas, response, logger);
                            } else {
                                //notification enregistrée
                                response.status(201).send(postData);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            logger.debug('no data');
                            responseError(context, {status_code: 500}, response, logger);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        responseError(context, error, response, logger);
                    });
            } else {
                return errorParsing(context,{status_code: 403});
            }

        } else {
            //aucune donnée postée
            return errorParsing(context,{status_code: 400});
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

function updateDevice(context, device, measure) {
    const logger = serverLogger.child({
        source: globalPrefix + ':updateDevice',
        httpRequestId: context.httpRequestId
    });

    return new Promise((resolve, reject) => {
        logger.debug('device: %j', device);
        logger.debug('measure: %j', measure);

        try {
            for (let idx1 = 0; idx1 < measure.capabilities.length; idx1++) {
                if (typeof measure.capabilities[idx1].value !== 'undefined') {
                    for (let idx2 = 0; idx2 < device.capabilities.length; idx2++) {
                        if (device.capabilities[idx2].name === measure.capabilities[idx1].name) {
                            device.capabilities[idx2].last_value = measure.capabilities[idx1].value;
                        }
                    }
                }
            }

            logger.debug('device: %j', device);
            resolve(device);
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
}