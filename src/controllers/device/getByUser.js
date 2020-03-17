const deviceGet = require('../../models/device/get.js');

const checkAuth = require('../../utils/checkAuth.js');
const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/device/user/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - user id - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {httpRequestId: request.httpRequestId};
    const logger = serverLogger.child({
        source: '/controllers/device/getByUser.js',
        httpRequestId: context.httpRequestId
    });

    try {
        let userInfo = checkAuth(context, request, response);
        logger.debug('userInfo: %sj', userInfo);

        let id = request.params.id;
        logger.debug( 'user id: %s', id);

        //traitement de recherche dans la base
        if (id) {
            if (userInfo.admin || id === userInfo.id) {
                //traitement de recherche dans la base
                let query = {user_id: id};
                deviceGet(context, query, 0, 0, false)
                    .then(devices => {
                        if (devices) {
                            if (devices.status_code) {
                                logger.error('error: %j', devices);
                                responseError(context, devices, response, logger);
                            } else {
                                logger.debug('devices: %j', devices);
                                response.status(200).send(devices);
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
                let error = errorParsing(context, {
                    status_code: 403,
                    status_message: 'User must be admin or search for his own device'
                });
                logger.error('error: %j', error);
                responseError(context, error, response, logger);
            }
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing ID'});
            logger.error('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
