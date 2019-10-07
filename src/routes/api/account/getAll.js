const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const accountGet = require('../../../models/api/account/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /1.0.0/account
 * @group Account - Operations about account
 * @returns {array.<Account>} 200 - An array of user info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/account/getAll');

    try {
        let userInfo = checkAuth(context, req, res);

        let query = {};
        if (!userInfo.admin) {
            query = {id: userInfo.id};
        }

        let skip = req.query.skip;
        if (typeof skip === 'undefined') skip = 0;
        // log4n.object(skip,'skip');
        let limit = req.query.limit;
        if (typeof limit === 'undefined') limit = 0;
        // log4n.object(limit,'limit');

        //traitement de recherche dans la base
        accountGet(context, query, skip, limit, false)
            .then(datas => {
                if (typeof datas === 'undefined') {
                    responseError(context, '', res, log4n);
                    log4n.debug('done - unknown error');
                } else {
                    if(typeof datas.status_code != 'undefined') {
                        responseError(context, datas, res, log4n);
                        log4n.debug('done - with error');
                    } else {
                        // log4n.object(datas, 'datas');
                        res.status(200).send(datas);
                        log4n.debug('done - ok');
                    }
                }
            })
            .catch(error => {
                responseError(context, error, res, log4n);
                log4n.debug('done - global catch');
            });
    } catch (exception) {
        log4n.error(exception.stack);
        responseError(context, exception, res, log4n);
    }
};
