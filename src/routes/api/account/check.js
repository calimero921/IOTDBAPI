const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const accountCheck = require('../../../models/api/account/check.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/check');
    log4n.object(req.params.email, 'email');
    log4n.object(req.params.password, 'password');
    log4n.object(req.sessionID, 'session_id');

    if (typeof req.params.email === 'undefined' || typeof req.params.password === 'undefined' || typeof req.sessionID === 'undefined') {
        responseError({error_code: 400, error_message: 'Missing parameters'}, res, log4n);
        log4n.debug('done - global catch');
    }

    accountCheck(req.params.email, req.params.password, req.sessionID)
        .then(result => {
            log4n.object(result, 'result');
            let value = {};
            value.checked = result;

            res.send(value);
        })
        .catch(error => {
            responseError(error, res, log4n)
        });
};