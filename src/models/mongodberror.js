const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

module.exports = function (error) {
    const log4n = new Log4n('/models/mongodberror');
    // log4n.object(error, 'error');

    try {
        let result = {};
        switch (error.code) {
            case 11000:
                result.error_code = 409;
                result.error_message = "Duplicate entry";
                break;
            default:
                result.error_code = error.code;
                result.error_message = error.message;
                break;
        }
        log4n.object(result, 'result');
        return errorparsing(result);
    } catch (error) {
        console.log('error:', error);
        log4n.debug('done - try catch')
        return errorparsing(error);
    }
};