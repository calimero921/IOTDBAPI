const checkAuth = require('../../../utils/checkAuth.js');
const set = require('../../../models/device/set.js');
const get = require('../../../models/device/get.js');

const serverLogger = require('../../../utils/serverLogger.js');
const responseError = require('../../../utils/responseError.js');

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
                get(context, query, 0, 0, true)
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                if (datas.status_code === 404) {
                                    if (!postData.user_id) postData.user_id = userInfo.id;
                                    return set(context, postData);
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
                        logger.debug('set datas: %j', datas);
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
                            logger.debug('no data');
                            responseError(context, {status_code: 500}, response, logger);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        responseError(context, error, response, logger);
                    });
            } else {
                return {status_code: '403'};
            }
        } else {
            //aucune donnée postée
            return {status_code: 400};
        }
    } catch (exception) {
        if (exception.message === "403") {
            responseError(context, {status_code: 403}, response, logger);
        } else {
            logger.error('exception: %s', exception.stack);
            responseError(context, exception, response, logger);
        }
    }
};
