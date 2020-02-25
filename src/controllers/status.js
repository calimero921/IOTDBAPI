const serverLogger = require('../utils/serverLogger.js');
const config = require('../config/server.js');
const responseError = require('../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /status
 * @returns {object} 200 - Api status with version / date
 * @returns {Error}  default - Unexpected error
 */

module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/status.js',
        httpRequestId: request.httpRequestId
    });

    try {
        // logger.debug(request.headers, 'headers');
        // logger.debug(request.path, 'path');
        // logger.debug(request.query, 'query');
        // logger.debug(request.params, 'params');
        // logger.debug(request.body, 'body');

        let result = {};
        result.swagger_version = config.swagger;
        result.last_update = config.date;
        logger.debug('result: %j', result);

        response.status(200).send(result);
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError({status_code: 500}, response, logger);
    }
};