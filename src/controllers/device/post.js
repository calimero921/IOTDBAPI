const deviceSet = require('../../models/device/set.js');
const deviceGet = require('../../models/device/get.js');

const checkAuth = require('../../utils/checkAuth.js');
const serverLogger = require('../../utils/ServerLogger.js');
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
    const logger = serverLogger.child({
        source: '/routes/api/device/post.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

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
