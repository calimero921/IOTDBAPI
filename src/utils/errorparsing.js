const Log4n = require('./log4n.js');

module.exports = function (error) {
    const log4n = new Log4n('/utils/errorparsing');

    if (typeof error === 'undefined') {
        log4n.debug('done unknown');
        return {error_code: 500, error_message: 'unknown error'};
    } else {
        if (typeof error.error_code === 'undefined') {
            log4n.debug('done prefix 500');
            return {error_code: 500, error_message: error};
        } else {
            log4n.debug('done unmodified');
            return error;
        }
    }
};