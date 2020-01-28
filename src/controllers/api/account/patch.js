const checkAuth = require('../../../utils/checkAuth.js');
const patch = require('../../../models/api/account/patch.js');
const get = require('../../../models/api/account/get.js');

const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route PATCH /v0/account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @param {Account.model} account.body.required - User details
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/api/account/patch.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        let id = request.params.id;
        logger.debug('id: %s', id);
        let token = request.params.token;
        logger.debug('token: %s', token);

        if (id && token && request.body) {
            if (userInfo.admin || (id === userInfo.id)) {
                let updatedata = request.body;
                logger.debug('updatedata: %j', updatedata);

                //supprime les champs id et token des données pouvant être mise à jour
                if (updatedata.id) {
                    delete updatedata.id;
                }
                if (updatedata.token) {
                    delete updatedata.token;
                }
                logger.debug('updatedata: %j', updatedata);
                get(context, {id: id}, 0, 0, false)
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (typeof datas.status_code === 'undefined') {
                            logger.debug(datas, 'datas');
                            let newdata = datas[0];
                            if (typeof newdata != 'undefined') {
                                for (let key in updatedata) {
                                    logger.debug('key: %s', key);
                                    newdata[key] = updatedata[key];
                                }
                                logger.debug('newdata: %j', newdata);
                                return patch(context, id, token, newdata)
                            } else {
                                return {status_code: '404'};
                            }
                        } else {
                            return (datas)
                        }
                    })
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (typeof datas.status_code === 'undefined') {
                            response.status(200).send(datas);
                        } else {
                            logger.debug('response error');
                            responseError(context, datas, response, logger);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        responseError(context, error, response, logger);
                    })
            } else {
                logger.debug('Forbidden');
                responseError(context, {status_code: 403}, response, logger);
            }
        } else {
            logger.debug('missing parameters');
            responseError(context, {status_code: 400, status_message: 'Missing parameters'}, response, logger);
        }
    } catch (exception) {
        logger.error('exception: %s', exception.stack);
        responseError(context, exception, response, logger);
    }
};
