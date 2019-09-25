const Log4n = require('./log4n.js');

module.exports = function (context, error) {
    const log4n = new Log4n(context, '/utils/errorparsing');
    // log4n.object(error, 'error in ');
    let result = {};

    if (typeof error === 'undefined') {
        result.error_code = 500;
        log4n.debug('done unknown');
    } else {
        if (typeof error.error_code === 'undefined') {
            result.error_code = 500;
            if (typeof error.errmsg !== 'undefined') {
                result.error_message = error.errmsg;
            } else {
                result.error_message = error;
                log4n.debug('done prefix 500');
            }
        } else {
            result = error;
        }
    }

    if (typeof result.error_message === 'undefined') {
        let message;
        switch (result.error_code) {
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
                message = "Bad Request";
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
        result.error_message = message;
    }

    // log4n.object(result, 'error out');
    return result;
};