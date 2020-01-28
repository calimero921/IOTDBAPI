const checkAuth = require('../../utils/checkAuth.js');
const accountDelete = require('../../models/account/delete.js');

const serverLogger = require('../../utils/ServerLogger.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route DELETE /v0/account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @returns {Error} 204
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/account/delete.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        let id;
        let token;
        if (typeof request.params !== 'undefined') {
            id = request.params.id;
            token = request.params.token;
        }
        logger.debug('id: %s', id);
        logger.debug('token: %s', token);

        //traitement de recherche dans la base
        if (typeof id === 'undefined' || typeof token === 'undefined') {
            responseError(context, {status_code: 400, status_message: 'Missing parameters'}, response, logger);
        } else {
            if (userInfo.admin || (id === userInfo.id)) {
                //traitement de suppression dans la base
                accountDelete(context, id, token)
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        response.status(204).send();
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        responseError(context, error, response, logger);
                    });
            } else {
                logger.error('user must be admin or account owner for this action');
                responseError(context, context, {status_code: 403}, response, logger);
            }
        }
    } catch (exception) {
        logger.debug('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};