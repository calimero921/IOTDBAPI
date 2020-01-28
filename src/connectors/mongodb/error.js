const Log4n = require('../../utils/log4n.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, error) {
    const log4n = new Log4n(context, '/connectors/mongodberror');
    // log4n.object(error, 'error');

    try {
        let result = {};
        switch (error.code) {
            case 11000:
                result.status_code = 409;
                result.status_message = "Duplicate entry";
                break;
            default:
                result.status_code = error.code;
                result.status_message = error.message;
                break;
        }
        log4n.object(result, 'result');
        return errorparsing(context, result);
    } catch (exception) {
        console.log('error:', exception);
        log4n.debug('done - try catch');
        return errorparsing(context, exception);
    }
};