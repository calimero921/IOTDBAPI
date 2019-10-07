const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const accountGet = require('../../../models/api/account/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /1.0.0/account/id/{id}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/account/getById');

    try {
        let userInfo = checkAuth(context, req, res);

        let id = req.params.id;
        // log4n.object(id,'id');

        if (userInfo.admin || id === userInfo.id) {
            let query = {id: id};
            let skip = req.query.skip;
            if (typeof skip === 'undefined') skip = 0;
            // log4n.object(skip,'skip');
            let limit = req.query.limit;
            if (typeof limit === 'undefined') limit = 0;
            // log4n.object(limit,'limit');

            //traitement de recherche dans la base
            if (typeof id === 'undefined') {
                //aucun id
                responseError(context, {status_code: 400, status_message: 'Missing parameters'}, res, log4n);
                log4n.debug('done - missing parameter');
            } else {
                //traitement de recherche dans la base
                accountGet(context, query, skip, limit, false)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            responseError(context, {status_code: 404}, res, log4n);
                            log4n.debug('done - not found');
                        } else {
                            // log4n.object(datas, 'datas');
                            res.status(200).send(datas);
                            log4n.debug('done - ok');
                        }
                    })
                    .catch(error => {
                        responseError(context, error, res, log4n);
                        log4n.debug('done - global catch');
                    });
            }
        } else {
            responseError(context, {status_code: 403, status_message: 'user must be admin for this action'}, res, log4n);
        }
    } catch (exception) {
        log4n.error(exception.stack);
        responseError(context, exception, res, log4n);
    }
};
