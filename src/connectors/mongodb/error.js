const serverLogger = require('../../utils/ServerLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, error) {
    const logger = serverLogger.child({
        source: '/connectors/mongodberror.js',
        httpRequestId: context.httpRequestId
    });

    try {
        logger.debug('error: %j', error);
        let result = {};
        if (error.status_code) {
            result = error;
        } else {
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
        }
        logger.debug('result: %j', result);
        return errorparsing(context, result);
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        return errorparsing(context, exception);
    }
};