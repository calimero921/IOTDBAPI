const checkAuth = require('../../utils/checkAuth.js');
const accountSet = require('../../models/account/set.js');

const serverLogger = require('../../utils/ServerLogger.js');
const responseError = require('../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route POST /v0/account
 * @group Account - Operations about account
 * @param {Account.model} account.body.required - User details
 * @returns {Account.model} 201 - User info
 * @returns {Error} default - Unexpected error
 */
module.exports = function (request, response) {
    const logger = serverLogger.child({
        source: '/controllers/account/post.js',
        httpRequestId: request.httpRequestId
    });
    let context = {httpRequestId: request.httpRequestId};

    try {
        let userInfo = checkAuth(context, request, response);

        //lecture des données postées
        if (request.body) {
            let datas = request.body;
            logger.debug('datas: %j', datas);
            if (userInfo.admin || ((datas.email === userInfo.email) && (datas.firstname === userInfo.firstname) && (datas.lastname === userInfo.lastname))) {
                //creation du compte
                accountSet(context, datas)
                    .then(datas => {
                        //recherche d'un code erreur précédent
                        if (typeof datas.status_code === 'undefined') {
                            //notification enregistrée
                            response.status(201).send(datas);
                        } else {
                            //erreur dans le processus d'enregistrement de la notification
                            logger.debug('error: %j', datas);
                            responseError(context, datas, response, logger);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', datas);
                        responseError(context, error, response, logger);
                    });
            } else {
                logger.error('user must be admin or account owner for this action');
                responseError(context, {status_code: 403}, response, logger);
            }
        } else {
            //aucune donnée postée
            return {status_code: 400, status_message: 'Missing parameters'};
        }
    } catch (exception) {
        responseError(context, exception, response, logger);
    }
};
