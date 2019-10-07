const Log4n = require('./log4n.js');
const errorParsing = require('./errorparsing.js');

module.exports = function (context, content, response, logger) {
    const log4n = new Log4n(context, '/utils/responseError');
    // log4n.object(content, 'content');

    let finalContent = errorParsing(context, content);
    let message = 'code: ';
    message += finalContent.status_code;
    if (typeof finalContent.status_message !== 'undefined') {
        message += ' / message: ' + finalContent.status_message;
    }
    logger.error(message);
    response.status(finalContent.status_code).send(finalContent.status_message);
    log4n.debug('done');
};