const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const accountSet = require('../../../models/api/account/set.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route POST /v0/account
 * @group Account - Operations about account
 * @param {Account.model} account.body.required - User details
 * @returns {Account.model} 201 - User info
 * @returns {Error} default - Unexpected error
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/account/post');

    try {
        let userInfo = checkAuth(context, req, res);

        //lecture des données postées
        decodePost(context, req, res)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    //aucune donnée postée
                    return {status_code: 400, status_message: 'Missing parameters'};
                } else {
                    if (userInfo.admin || ((datas.email === userInfo.email) && (datas.firstname === userInfo.firstname) && (datas.lastname === userInfo.lastname))) {
                        //creation du compte
                        return accountSet(context, datas);
                    } else {
                        log4n.error('user must be admin or account owner for this action');
                        return {status_code: 403};
                    }
                }
            })
            .then(datas => {
                //recherche d'un code erreur précédent
                if (typeof datas.status_code === 'undefined') {
                    //notification enregistrée
                    res.status(201).send(datas);
                    log4n.debug('done - ok');
                } else {
                    //erreur dans le processus d'enregistrement de la notification
                    responseError(context, datas, res, log4n);
                    log4n.debug('done - response error');
                }
            })
            .catch(error => {
                responseError(context, error, res, log4n);
                log4n.debug('done - promise catch');
            });
    } catch (exception) {
        responseError(context,exception, res, log4n);
    }
};
