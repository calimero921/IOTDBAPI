const checkAuth = require('../../utils/checkAuth.js');
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
    let context = {httpRequestId: request.httpRequestId};
    const logger = serverLogger.child({
        source: '/controllers/account/post.js',
        httpRequestId: context.httpRequestId
    });

    try {
        let userInfo = checkAuth(context, request, response);
        logger.debug('userInfo: %j', userInfo);
        let requestBody = request.body;
        logger.debug('requestBody: %j', requestBody);

        if (requestBody) {
            if (userInfo.admin || ((requestBody.email === userInfo.email) && (requestBody.firstname === userInfo.firstname) && (requestBody.lastname === userInfo.lastname))) {
                setAccount(context, requestBody)
                    .then(createdAccount => {
                        if (createdAccount.status_code) {
                            logger.debug('error: %j', createdAccount);
                            responseError(context, createdAccount, response, logger);
                        } else {
                            logger.debug('createdAccount: %j', createdAccount);
                            response.status(201).send(createdAccount);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', requestBody);
                        responseError(context, error, response, logger);
                    });
            } else {
                let error = errorParsing(context, {status_code: 403, status_message: 'user must be admin or account owner for this action'});
                logger.debug('error: %j', error);
                responseError(context, error, response, logger);
            }
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
