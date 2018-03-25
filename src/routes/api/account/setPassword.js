const Log4n = require('../../../utils/log4n.js');
const decodePost = require('../../../utils/decodePost.js');
const responseError = require('../../../utils/responseError.js');
const errorparsing = require('../../../utils/errorparsing.js');
const accountGetByEmail = require('../../../models/api/account/getByEmail.js');
const accountSetPassword = require('../../../models/api/account/setPassword.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/router/api/account/setPassword');
    let form;
    decodePost(req, res)
        .then(data => {
            log4n.object(data, 'form');
            if (typeof data === 'undefined') return errorparsing({
                error_code: 400,
                error_message: 'missing parameters'
            });
            if (typeof data.email === 'undefined' || typeof data.token === 'undefined') return errorparsing({
                error_code: 400,
                error_message: 'missing parameters'
            });
            form = data;
            return accountGetByEmail(data.email);
        })
        .then(data => {
            // log4n.object(data, 'user');
            if (typeof data.error_code !== 'undefined') return data;
            if (data.length === 0) return errorparsing({
                error_code: 404,
                error_message: 'unknown user in database (' + form.email + ')'
            });
            let user = data[0];
            // log4n.object(user.token, 'user.token');
            // log4n.object(form.token, 'form.token');
            if (user.token !== form.token) return errorparsing({error_code: 403, error_message: 'wrong token'});
            return accountSetPassword(form.email, form.password);
        })
        .then(data => {
            // log4n.object(data, 'result');
            if (typeof data.error_code === 'undefined') {
                res.send(data);
                log4n.debug('done - ok')
            } else {
                log4n.object(data, 'error');
                responseError(data, res, log4n);
                log4n.debug('done - error')
            }
        })
        .catch(error => {
            log4n.object(error, 'error');
            responseError(error, res, log4n);
            log4n.debug('done - promise catch')
        });
};