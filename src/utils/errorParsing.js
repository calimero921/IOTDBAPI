// const serverLogger = require('./ServerLogger.js');

module.exports = function (context, error, reset) {
    // const logger = serverLogger.child({
    //     source: '/utils/errorParsing.js',
    //     httpRequestId: context.httpRequestId
    // });

    if(typeof reset === 'undefined') reset = false;
    if(reset && error.status_message) delete error.status_message;

    // logger.debug('error: %j', error);
    let result = {};

    if (!error) {
        result.status_code = 500;
    } else {
        if (error.status_code) {
            result = error;
            // logger.debug('already formated');
        } else {
            result.status_code = 500;
            if (error.errmsg) {
                result.status_message = error.errmsg;
                // logger.debug('prefix 500, errmsg');
            } else {
                if (error.stack) {
                    result.status_message = error.stack;
                    // logger.debug('prefix 500, stack');
                } else {
                    result.status_message = error;
                    // logger.debug('prefix 500, message');
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

    // logger.debug('error out: %j', result);
    return result;
};