const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const responseError = require('../../../utils/responseError.js');
const accountGet = require('../../../models/api/account/get.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /1.0.0/account
 * @group Account - Operations about account
 * @returns {array.<Account>} 200 - An array of user info
 * @returns {Error} default - Unexpected error
 * @returns {Error} 403 - Forbidden
 * @security Bearer
 */
module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/get');

    try {
        let userInfo = checkAuth(req, res);

        let query = {};
        if (!userInfo.admin) {
            query = {id: userInfo.id};
        }

        // log4n.object(req.query.skip,'skip');
        let skip = req.query.skip;
        if (typeof skip === 'undefined') skip = 0;
        // log4n.object(req.query.limit,'limit');
        let limit = req.query.limit;
        if (typeof limit === 'undefined') limit = 0;

        //traitement de recherche dans la base
        accountGet(query, skip, limit, false)
            .then(datas => {
                if (typeof datas === 'undefined') {
                    responseError({error_code: 404}, res, log4n);
                    log4n.debug('done - not found');
                } else {
                    // log4n.object(datas, 'datas');
                    res.status(200).send(datas);
                    log4n.debug('done - ok');
                }
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - global catch');
            });
    } catch (exception) {
        if (exception.message === "403") {
            responseError({error_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError({error_code: 500}, res, log4n);
        }
    }
};
