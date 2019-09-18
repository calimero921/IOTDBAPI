const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const accountGet = require('../../../models/api/account/get.js');

const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /1.0.0/account/email/{email}
 * @group Account - Operations about account
 * @param {string} email.path.required - User Email - eg: emmanuel.david@orange.com
 * @returns {Account.model} 200 - User info
 * @returns {Error} default - Unexpected error
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @security Bearer
 */
module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/getByEmail');

    try {
        let userInfo = checkAuth(req, res);

        // log4n.object(req.params.email, 'email');
        let email = req.params.email;
        if (userInfo.admin || email === userInfo.email) {
            let query = {email: email};
            // log4n.object(req.query.skip,'skip');
            let skip = req.query.skip;
            if (typeof skip === 'undefined') skip = 0;
            // log4n.object(req.query.limit,'limit');
            let limit = req.query.limit;
            if (typeof limit === 'undefined') limit = 0;

            //traitement de recherche dans la base
            if (typeof email === 'undefined') {
                responseError({error_code: 400}, res, log4n);
                log4n.debug('done - missing parameter');
            } else {
                //traitement de recherche dans la base
                accountGet(query, skip, limit, false)
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        res.status(200).send(datas);
                        log4n.debug('done - ok');
                    })
                    .catch(error => {
                        responseError(error, res, log4n);
                        log4n.debug('done - global catch');
                    });
            }
        } else {
            responseError({error_code: 403, error_message:'user must be admin or account owner for this action'}, res, log4n);
        }
    } catch (exception) {
        if (exception.message === "403") {
            responseError({error_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError({error_code: 500}, res, log4n);
        }
    }
};