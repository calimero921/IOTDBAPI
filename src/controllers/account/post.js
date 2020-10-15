const setAccount = require('../../models/account/set.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route POST /account
 * @group Account - Operations about account
 * @param {Account.model} account.body.required - User details
 * @returns {Account.model} 201 - User info
 * @returns {Error} default - Unexpected error
 */
module.exports = function (request, response) {
    let context = {
        httpRequestId: request.httpRequestId,
        authorizedClient: request.authorizedClient
    };
    const logger = serverLogger.child({
        source: '/controllers/account/post.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let requestBody = request.body;
        logger.debug('requestBody: %j', requestBody);

        if (requestBody) {
            setAccount(context, requestBody)
                .then(createdAccount => {
                    if (createdAccount.status_code) {
                        logger.debug('error: %j', createdAccount);
                        responseError(context, createdAccount, response, logger);
                    } else {
                        logger.debug('createdAccount: %j', createdAccount);
                        logger.debug('account created for id %s', createdAccount.id);
                        response.status(201).send(createdAccount);
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', requestBody);
                    responseError(context, error, response, logger);
                });
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'});
            logger.debug('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.debug('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
