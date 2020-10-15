const getAccount = require('../../models/account/get.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /account/session/{session_id}
 * @group Account - Operations about account
 * @param {string} session_id.path.required - eg: 2lPe21SQcHJoD_1UY7l3I82NOrS_Hzw9
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/controllers/account/getBySession.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        let session_id = request.params.session_id;
        logger.debug('session_id: %s', session_id);

        //traitement de recherche dans la base
        if (session_id) {
            let filter = {session_id: session_id};
            if (!userInfo.admin) filter.id = userInfo.id;
            logger.debug('filter: %s', filter);
            let skip = request.query.skip;
            if (!skip) skip = 0;
            logger.debug('skip: %s', skip);
            let limit = request.query.limit;
            if (!limit) limit = 0;
            logger.debug('limit: %s', limit);

            getAccount(context, filter, 0, 0, false)
                .then(accounts => {
                    if (accounts.status_code) {
                        logger.error('error: %j', accounts);
                        responseError(context, accounts, response, logger);
                    } else {
                        logger.debug('accounts: %j', accounts);
                        logger.info('account(s) found for session %s', filter.session_id);
                        response.status(200).send(accounts);
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    responseError(context, error, response, logger);
                });
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'});
            logger.debug('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error(exception.stack);
        responseError(context, exception, response, logger);
    }
};