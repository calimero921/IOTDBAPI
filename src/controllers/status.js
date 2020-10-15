const configuration = require('../config/Configuration.js');
const serverLogger = require('../utils/serverLogger.js');
const responseError = require('../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /status
 * @returns {object} 200 - Api status with version / date
 * @returns {Error}  default - Unexpected error
 */

module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    }
    const logger = serverLogger.child({
        source: '/controllers/status.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        // logger.debug(request.headers, 'headers');
        // logger.debug(request.path, 'path');
        // logger.debug(request.query, 'query');
        // logger.debug(request.params, 'params');
        // logger.debug(request.body, 'body');

        let result = {};
        result.swagger_version = configuration.server.swagger;
        logger.debug('result: %j', result);

        response.status(200).send(result);
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};