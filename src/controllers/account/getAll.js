const checkAuth = require('../../utils/checkAuth.js');
const getAccount = require('../../models/account/get.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /account
 * @group Account - Operations about account
 * @returns {array.<Account>} 200 - An array of user info
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {httpRequestId: request.httpRequestId};
    const logger = serverLogger.child({
        source: '/controllers/account/getAll.js',
        httpRequestId: context.httpRequestId
    });

    try {
        let userInfo = checkAuth(context, request, response);
        logger.debug('userInfo: %j', userInfo);

        let filter;
        if (!userInfo.admin) filter = {id: userInfo.id};
        logger.debug('filter: %j', filter);

        let skip = request.query.skip;
        if (!skip) skip = 0;
        logger.debug('skip: %s', skip);

        let limit = request.query.limit;
        if (!limit) limit = 0;
        logger.debug('limit: %s', limit);

        //traitement de recherche dans la base
        getAccount(context, filter, skip, limit, false)
            .then(accounts => {
                if (accounts) {
                    if (accounts.status_code) {
                        logger.error('error: %j', error);
                        responseError(context, accounts, response, logger);
                    } else {
                        logger.debug('accounts: %j', accounts);
                        response.status(200).send(accounts);
                    }
                } else {
                    let error = errorParsing(context, {status_code: 404, status_message: 'no account found'});
                    logger.debug('error: %j', error);
                    responseError(context, error, response, logger);
                }
            })
            .catch(error => {
                logger.debug('error: %j', error);
                responseError(context, error, response, logger);
            });
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
