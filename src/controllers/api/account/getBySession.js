const checkAuth = require('../../../utils/checkAuth.js');
const accountGet = require('../../../models/account/get.js');

const serverLogger = require('../../../utils/serverLogger.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/account/session/{session_id}
 * @group Account - Operations about account
 * @param {string} session_id.path.required - eg: 2lPe21SQcHJoD_1UY7l3I82NOrS_Hzw9
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/api/account/getBySession.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        if (userInfo.admin) {
            let session_id = request.params.session_id;
            logger.debug( 'session_id: %s', session_id);

            //traitement de recherche dans la base
            if (typeof session_id === 'undefined') {
                logger.debug('missing parameter');
                responseError(context, {status_code: 400, status_message: 'Missing parameters'}, response, logger);
            } else {
                //traitement de recherche dans la base
                accountGet(context, {session_id: session_id}, 0, 0, false)
                    .then(datas => {
                        logger.debug( 'datas: %j', datas);
                        response.status(200).send(datas);
                    })
                    .catch(error => {
                        logger.error( 'error: %j', error);
                        responseError(context, error, response, logger);
                    });
            }
        } else {
            responseError(context, {status_code: 403, status_message: 'user must be admin for this action'}, response, logger);
        }
    } catch (exception) {
        logger.error(exception.stack);
        responseError(context, exception, response, logger);
    }
};