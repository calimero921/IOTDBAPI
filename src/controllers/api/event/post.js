const checkAuth = require('../../../utils/checkAuth.js');
const set = require('../../../models/event/set.js');
const update = require('../../../models/device/patch.js');
const get = require('../../../models/device/get.js');

const serverLogger = require('../../../utils/serverLogger.js');
const errorparsing = require('../../../utils/errorparsing.js');
const responseError = require('../../../utils/responseError.js');

const globalPrefix = '/routes/api/event/post.js';
/**
 * This function comment is parsed by doctrine
 * @route POST /v0/measure
 * @group Measure - Operations about measure
 * @param {Measure.model} measure.body.required - Device details
 * @returns {Measure.model} 201 - Device info
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        if (request.body) {
            //lecture des données postées
            let postData = request.body;
            logger.debug('postData: %j', postData);
            let device;

            //lecture des données postées
            if (userInfo.admin || userInfo.id === postData.user_id) {
                let query = {device_id: postData.device_id};
                get(context, query, 0, 0, true)
                    .then(datas => {
                        logger.debug('get device: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                return datas;
                            } else {
                                device = datas[0];
                                return set(context, postData);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return errorparsing(context,{status_code: 500, status_message: 'No datas'});
                        }
                    })
                    .then(datas => {
                        logger.debug('set measure: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                return datas;
                            } else {
                                postData = datas;
                                return updateDevice(context, device, postData);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return errorparsing(context, {status_code: 500, status_message: 'No datas'});
                        }
                    })
                    .then(datas => {
                        // logger.debug(datas, 'set measure');
                        if (datas) {
                            if (datas.status_code) {
                                return datas;
                            } else {
                                return update(context, postData.device_id, datas);
                            }
                        } else {
                            //aucune données recue du processus d'enregistrement
                            return errorparsing(context,{status_code: 500, status_message: 'No datas'});
                        }
                    })
                    .then(datas => {
                        // logger.debug(datas, 'update device');
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
                return errorparsing(context,{status_code: '403'});
            }

        } else {
            //aucune donnée postée
            return errorparsing(context,{status_code: 400});
        }
    } catch (exception) {
        logger.error(exception.stack);
        responseError(context, exception, response, logger);
    }
};

function updateDevice(context, device, measure) {
    const logger = serverLogger.child({
        source: globalPrefix + ':updateDevice',
        httpRequestId: request.httpRequestId
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
            reject(errorparsing(context, exception));
        }
    });
}