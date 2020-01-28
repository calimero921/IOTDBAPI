const checkAuth = require('../../../utils/checkAuth.js');
const accountGet = require('../../../models/account/get.js');

const serverLogger = require('../../../utils/serverLogger.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/account/email/{email}
 * @group Account - Operations about account
 * @param {string} email.path.required - eg: emmanuel.david@orange.com
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/api/account/getByEmail.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        let email = request.params.email;
        logger.debug('email: %s', email);
        if (userInfo.admin || email === userInfo.email) {
            let query = {email: email};
            let skip = request.query.skip;
            if (typeof skip === 'undefined') skip = 0;
            logger.debug('skip: %s', skip);
            let limit = request.query.limit;
            if (typeof limit === 'undefined') limit = 0;
            logger.debug('limit: %s', limit);

            //traitement de recherche dans la base
            if (typeof email === 'undefined') {
                logger.debug('missing parameter');
                responseError(context, {status_code: 400, status_message: 'Missing parameters'}, response, logger);
            } else {
                //traitement de recherche dans la base
                accountGet(context, query, skip, limit, false)
                    .then(datas => {
                        logger.debug( 'datas: %j', datas);
                        response.status(200).send(datas);
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        responseError(context, error, response, logger);
                    });
            }
        } else {
            responseError(context, {status_code: 403, status_message: 'user must be admin or account owner for this action'}, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};