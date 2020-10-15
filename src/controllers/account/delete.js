const deleteAccount = require('../../models/account/delete.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route DELETE /account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @returns {Error} 204
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
        source: '/controllers/account/delete.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    try {
        let userInfo = request.userinfo;
        logger.debug('userInfo: %j', userInfo);

        let id = request.params.id;
        logger.debug('id: %s', id);
        let token = request.params.token;
        logger.debug('token: %s', token);

        //traitement de suppression dans la base
        if (id && token) {
            if (userInfo.admin || (id === userInfo.id)) {
                deleteAccount(context, id, token)
                    .then(deletedAccount => {
                        if (deletedAccount) {
                            if (deletedAccount.status_code) {
                                logger.error('error: %j', error);
                                responseError(context, deletedAccount, response, logger);
                            } else {
                                logger.debug('deleted accounts: %j', deletedAccount);
                                logger.info('account deleted for id %s', deletedAccount.id);
                                response.status(200).send(deletedAccount);
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
            } else {
                let error = errorParsing(context, {
                    status_code: 403,
                    status_message: 'user must be admin or account owner for this action'
                });
                logger.error('error : %j', error);
                responseError(context, error, response, logger);
            }
        } else {
            let error = errorParsing(context, {status_code: 400, status_message: 'missing parameters'});
            logger.debug('error: %j', error);
            responseError(context, error, response, logger);
        }
    } catch (exception) {
        logger.debug('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};