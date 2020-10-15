const serverLogger = require('./ServerLogger.js');

module.exports = function (context, error, reset) {
    const logger = serverLogger.child({
        source: '/utils/errorParsing.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    if(!reset) reset = false;
    if(reset && error.status_message) delete error.status_message;

    logger.debug('error: %j', error);
    let result = {};

    if (!error) {
        result.status_code = 500;
    } else {
        if (error.status_code) {
            logger.debug('already formated');
            result = error;
        } else {
            result.status_code = 500;
            if (error.errmsg) {
                logger.debug('prefix 500, errmsg');
                result.status_message = error.errmsg;
            } else {
                if (error.stack) {
                    logger.debug('prefix 500, stack');
                    result.status_message = error.stack;
                } else {
                    logger.debug('prefix 500, message');
                    result.status_message = error;
                }
            }
        }
    }

    if (!result.status_message) {
        let message;
        switch (result.status_code) {
            case 400:
                message = "Bad Request";
                break;
            case 401:
                message = "Unauthorized";
                break;
            case 403:
                message = "Forbidden";
                break;
            case 404:
                message = "Not Found";
                break;
            case 405:
                message = "Method Not Allowed";
                break;
            case 408:
                message = "Request Timeout";
                break;
            case 409:
                message = "Conflict";
                break;
            case 500:
                message = "Internal Server Error";
                break;
            default:
                message = 'Unknown error';
                break;
        }
        result.status_message = message;
    }

    logger.debug('error out: %j', result);
    return result;
};