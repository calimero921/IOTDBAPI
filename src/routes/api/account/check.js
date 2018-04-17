const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const accountCheck = require('../../../models/api/account/check.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/check');
    log4n.object(req.params.login, 'login');
    log4n.object(req.params.password, 'password');
    log4n.object(req.params.session, 'session');

    if (typeof req.params.login === 'undefined' || typeof req.params.password === 'undefined' || typeof req.params.session === 'undefined') {
        responseError({error_code: 400, error_message: 'Missing parameters'}, res, log4n);
        log4n.debug('done - global catch');
    }

    accountCheck(req.params.login, req.params.password, req.params.session)
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