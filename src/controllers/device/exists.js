const deviceGet = require('../../models/device/get.js');

const checkAuth = require('../../utils/checkAuth.js');
const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

const globalPrefix = '/controllers/device/exists.js';
/**
 * This function comment is parsed by doctrine
 * @route GET /v0/device/exists/{manufacturer}/{model}/{serial}/{secret}
 * @group Device - Operations about device
 * @param {String} manufacturer.path.required - eg: edavid
 * @param {String} model.path.required - eg: MS001
 * @param {String} serial.path.required - eg: 0123456789
 * @param {String} secret.path.required - eg: 21C823DC4721EAE56D774D4BE99CBA62
 * @returns {Object} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {httpRequestId: request.httpRequestId};
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId
    });

    try {
        let userInfo = checkAuth(context, request, response);
        logger.debug('userInfo: %sj', userInfo);

        let manufacturer = request.params.manufacturer;
        logger.debug('manufacturer: %s', manufacturer);
        let model = request.params.model;
        logger.debug('model: %s', model);
        let serial = request.params.serial;
        logger.debug('serial :%s', serial);
        let secret = request.params.secret;
        logger.debug('secret: %s', secret);

        //traitement de recherche dans la base
        if (manufacturer && model && serial && secret) {
            //traitement de recherche dans la base
            let query = {manufacturer: manufacturer, model: model, serial: serial, secret: secret};
            deviceGet(context, query, 0, 0, false)
                .then(datas => {
                    if (datas) {
                        if (datas.status_code) {
                            logger.error('error: %j', datas);
                            responseError(context, datas, response, logger);
                        } else {
                            logger.debug('datas: %j', datas);
                            let results = [];
                            for (let idx = 0; idx < datas.length; idx++) {
                                if (datas.hasOwnProperty(idx)) {
                                    if (userInfo.admin || (datas[idx].user_id) === userInfo.id) {
                                        results.push(datas[idx]);
                                    }
                                }
                            }
                            logger.debug('results: %j', results);
                            if (results.length > 0) {
                                response.status(200).send({device_id: results[0].device_id});
                            } else {
                                let error = errorParsing(context, {status_code: 403, status_message: 'User not admin nor owner of device'});
                                logger.error('error: %j', error);
                                responseError(context, error, response, logger);
                            }
                        }
                    } else {
                        let error = errorParsing(context, {status_code: 404});
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            //informations manquantes
            let error = errorParsing(context, {status_code: 400, status_message: 'Missing parameters'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error(exception.stack);
        responseError(context, exception, response, logger);
    }
};
