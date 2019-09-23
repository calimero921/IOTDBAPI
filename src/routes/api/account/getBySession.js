const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const responseError = require('../../../utils/responseError.js');
const accountGet = require('../../../models/api/account/get.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /1.0.0/account/session/{session_id}
 * @group Account - Operations about account
 * @param {string} session_id.path.required - eg: 2lPe21SQcHJoD_1UY7l3I82NOrS_Hzw9
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/getBySession');

    try {
        let userInfo = checkAuth(req, res);

        if (userInfo.admin) {
            let session_id = req.params.session_id;
            log4n.object(session_id, 'session_id');

            //traitement de recherche dans la base
            if (typeof session_id === 'undefined') {
                responseError({error_code: 400}, res, log4n);
                log4n.debug('done - missing parameter');
            } else {
                //traitement de recherche dans la base
                accountGet({session_id: session_id}, 0, 0, false)
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        res.status(200).send(datas);
                        log4n.debug('done - ok');
                    })
                    .catch(error => {
                        responseError(error, res, log4n);
                        log4n.debug('done - promise catch');
                    });
            }
        } else {
            responseError({error_code: 403, error_message:'user must be admin for this action'}, res, log4n);
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