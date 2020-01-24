// const serverLogger = require('./ServerLogger.js');
const errorParsing = require('./errorParsing.js');

module.exports = function (context, content, response, sourcelogger) {
    // const logger = serverLogger.child({
    //     source: '/utils/responseError.js',
    //     httpRequestId: context.httpRequestId
    // });

    // logger.debug('content: %j', content);
    let finalContent = errorParsing(context, content, true);
    let message = 'code: ';
    message += finalContent.status_code;
    if (typeof finalContent.status_message !== 'undefined') {
        message += ' / message: ' + finalContent.status_message;
    }
    sourcelogger.error('%j', message);
    response.status(finalContent.status_code).send(finalContent.status_message);
};