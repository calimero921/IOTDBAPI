const checkAuth = require('../../../utils/checkAuth.js');
const accountGet = require('../../../models/api/account/get.js');

const serverLogger = require('../../../utils/serverLogger.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/account
 * @group Account - Operations about account
 * @returns {array.<Account>} 200 - An array of user info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/api/account/getAll.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        let query = {};
        if (!userInfo.admin) {
            query = {id: userInfo.id};
        }

        let skip = request.query.skip;
        if (typeof skip === 'undefined') skip = 0;
        logger.debug('skip: %s', skip);
        let limit = request.query.limit;
        if (typeof limit === 'undefined') limit = 0;
        logger.debug('limit: %s', limit);

        //traitement de recherche dans la base
        accountGet(context, query, skip, limit, false)
            .then(datas => {
                if (typeof datas === 'undefined') {
                    logger.debug('undefined error');
                    responseError(context, '', response, logger);
                } else {
                    if(typeof datas.status_code != 'undefined') {
                        logger.debug('unknown error');
                        responseError(context, datas, response, logger);
                    } else {
                        logger.debug('datas: %j', datas);
                        response.status(200).send(datas);
                    }
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
