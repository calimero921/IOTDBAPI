const checkAuth = require('../../utils/checkAuth.js');
const get = require('../../models/device/get.js');
const patch = require('../../models/device/patch.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route PATCH /v0/device/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {Device.model} device.body.required - Device details
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/routes/api/device/patch.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        let device_id = request.params.id;
        logger.debug('id: %s', device_id);

        if (device_id && request.body) {
            let newData = request.body;
            logger.debug('newData: %j', newData);
            get(context, {device_id: device_id}, 0, 0, false)
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (typeof datas === 'undefined') {
                        return errorParsing(context, {status_code: 500, status_message: 'no data'})
                    } else {
                        if (datas.status_code) {
                            return datas;
                        } else {
                            if (userInfo.admin || (datas.user_id === userInfo.id)) {
                                if (datas.length > 0) {
                                    return patch(context, datas[0].device_id, newData);
                                } else {
                                    return errorParsing(context, {status_code: 404});
                                }
                            } else {
                                return {status_code: '403'};
                            }
                        }
                    }
                })
                .then(datas => {
                    logger.debug('datas: %j', datas);
                    if (datas) {
                        if (datas.status_code) {
                            logger.debug('error: %j', datas);
                            responseError(context, datas, response, logger);
                        } else {
                            response.status(200).send(datas);
                        }
                    } else {
                        logger.debug('internal server error');
                        responseError(context, {status_code: 500}, response, logger);
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            logger.debug('missing parameters');
            responseError(context, {status_code: 400}, response, logger);
        }
    } catch (exception) {
        if (exception.message === "403") {
            responseError(context, {status_code: 403}, response, logger);
        } else {
            logger.error(exception.stack);
            responseError(context, {status_code: 500}, response, logger);
        }
    }
};
