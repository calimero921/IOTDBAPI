const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const accountDelete = require('../../../models/api/account/delete.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route DELETE /v0/account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @returns {Error} 204
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/account/delete');

    try {
        let userInfo = checkAuth(context, req, res);

        let id;
        let token;
        if (typeof req.params !== 'undefined') {
            id = req.params.id;
            token = req.params.token;
        }
        // log4n.object(id,'id');
        // log4n.object(token,'token');

        //traitement de recherche dans la base
        if (typeof id === 'undefined' || typeof token === 'undefined') {
            responseError(context, {status_code: 400, status_message: 'Missing parameters'}, res, log4n);
        } else {
            if (userInfo.admin || (id === userInfo.id)) {
                //traitement de suppression dans la base
                accountDelete(context, id, token)
                    .then(data => {
                        // log4n.object(datas, 'datas');
                        res.status(204).send();
                        log4n.debug('done - ok');
                    })
                    .catch(error => {
                        responseError(context, error, res, log4n);
                        log4n.debug('done - promise catch');
                    });
            } else {
                log4n.error('user must be admin or account owner for this action');
                responseError(context, context, {status_code: 403}, res, log4n);
            }
        }
    } catch (exception) {
        responseError(context, exception, res, log4n);
    }
};