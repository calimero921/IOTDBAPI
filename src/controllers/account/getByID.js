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
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/controllers/account/getById.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        let id = request.params.id;
        logger.debug('id: %s', id);

        //traitement de recherche dans la base
        if (id) {
            let filter = {id: id};
            logger.debug('filter: %s', filter);
            if (userInfo.admin || id === userInfo.id) {
                //traitement de recherche dans la base
                getAccount(context, filter, 0, 0, false)
                    .then(accounts => {
                        if (accounts) {
                            if (accounts.status_code) {
                                logger.error('error: %j', accounts);
                                responseError(context, accounts, response, logger);
                            } else {
                                logger.debug('account(s): %j', accounts);
                                logger.info('account(s) found for id %s', filter.id);
                                response.status(200).send(accounts[0]);
                            }
                        } else {
                            let error = errorParsing(context, {status_code: 404, status_message: 'no result'});
                            logger.error('error: %j', error);
                            responseError(context, error, response, logger);
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
