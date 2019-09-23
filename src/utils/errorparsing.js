const Log4n = require('./log4n.js');

module.exports = function (error) {
    const log4n = new Log4n('/utils/errorparsing');

    if (typeof error === 'undefined') {
        log4n.debug('done unknown');
        error = {error_code: 500};
    } else {
        if (typeof error.error_code === 'undefined') {
            log4n.debug('done prefix 500');
            error = {error_code: 500, error_message: error};
        }
    }

    log4n.debug('done unmodified - conpleted if needed');
    if (typeof error.error_message === 'undefined') {
        let message;
        switch (error.error_code) {
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
                message = 'Unmanaged error';
                break;
        }
        error.error_message = message;
    }
    return error;
};