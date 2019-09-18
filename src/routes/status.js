const server = require('../config/server.js');

const Log4n = require('../utils/log4n.js');
const responseError = require('../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /status
 * @returns {object} 200 - Api status with version / date
 * @returns {Error}  default - Unexpected error
 */

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/status');

    try {
        // log4n.object(req.headers, 'headers');
        // log4n.object(req.path, 'path');
        // log4n.object(req.query, 'query');
        // log4n.object(req.params, 'params');
        // log4n.object(req.body, 'body');

        let result = {};
        result.swagger_version = server.swagger;
        result.last_update = server.date;
        log4n.object(result, 'result');

        res.status(200).send(result);
        log4n.debug('done');
    } catch (exception) {
        log4n.error(exception.stack);
        responseError({error_code: 500}, res, log4n);
    }
};