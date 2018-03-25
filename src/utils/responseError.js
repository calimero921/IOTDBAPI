const Log4n = require('./log4n.js');

module.exports = function (content, response, logger) {
    const log4n = new Log4n('/utils/responseError');
    log4n.object(content, 'content');

    if (typeof content.error_code === 'undefined') {
        logger.error(content);
        response.status(500);
        response.send(content);
    } else {
        let message = 'code: ';
        message += content.error_code;
        if (typeof content.error_message !== 'undefined') message += ' / message: ' + content.error_message;
        logger.error(message);
        response
            .status(content.error_code)
            .send(content.error_message);
    }
    log4n.debug('done');
};