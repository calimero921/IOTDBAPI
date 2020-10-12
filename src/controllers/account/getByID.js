const checkAuth = require('../../utils/checkAuth.js');
const getAccount = require('../../models/account/get.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /account/id/{id}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Account.model} 200 - User info
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    let context = {httpRequestId: request.httpRequestId};
    const logger = serverLogger.child({
        source: '/controllers/account/getById.js',
        httpRequestId: context.httpRequestId
    });

    try {
        let userInfo = checkAuth(context, request, response);
        logger.debug('userInfo: %j', userInfo);

        let id = request.params.id;
        logger.debug('id: %s', id);

        //traitement de recherche dans la base
        if (id) {
            let filter;
            if (userInfo.admin || id === userInfo.id) filter = {id: id};
            logger.debug('filter: %s', filter);
            if (filter) {
                let skip = request.query.skip;
                if (!skip) skip = 0;
                logger.debug('skip: %s', skip);
                let limit = request.query.limit;
                if (!limit) limit = 0;
                logger.debug('limit: %s', limit);

                //traitement de recherche dans la base
                getAccount(context, filter, skip, limit, false)
                    .then(accounts => {
                        if (accounts.status_code) {
                            logger.error('error: %j', accounts);
                            responseError(context, accounts, response, logger);
                        } else {
                            logger.debug('accounts: %j', accounts);
                            response.status(200).send(accounts);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        responseError(context, error, response, logger);
                    });
            } else {
                responseError(context, {
                    status_code: 403,
                    status_message: 'user must be admin or account owner for this action'
                }, response, logger);
            }
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'});
            logger.debug('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
