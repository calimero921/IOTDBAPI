const getDevice = require('../../models/device/get.js');

const checkAuth = require('../../utils/checkAuth.js');
const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /device/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {httpRequestId: request.httpRequestId};
    const logger = serverLogger.child({
        source: '/controllers/device/getById.js',
        httpRequestId: context.httpRequestId
    });

    try {
        let userInfo = checkAuth(context, request, response);
        logger.debug('userInfo: %j', userInfo);

        let id = request.params.id;
        logger.debug('device id', id);

        //traitement de recherche dans la base
        if (id) {
            let filter = {device_id: id};
            if (!userInfo.admin) filter.user_id = userInfo.id;
            logger.debug('filter: %s', filter);
            getDevice(context, filter, 0, 0, false)
                .then(devices => {
                    if (devices) {
                        if (devices.status_code) {
                            logger.error('error: %j', devices);
                            responseError(context, devices, response, logger);
                        } else {
                            logger.debug('devices: %j', devices);
                            response.status(200).send(devices[0]);
                        }
                    } else {
                        let error = errorParsing(context, {status_code: 404, status_message: 'no result'});
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
