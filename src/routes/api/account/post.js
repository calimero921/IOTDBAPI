const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const accountSet = require('../../../models/api/account/set.js');

const responseError = require('../../../utils/responseError.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/post');

    try {
        let userInfo = checkAuth(req, res);

        //lecture des données postées
        decodePost(req, res)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    //aucune donnée postée
                    return errorparsing({error_code: 400});
                } else {
                    if (userInfo.admin || ((datas.email === userInfo.email) && (datas.firstname === userInfo.firstname) && (datas.lastname === userInfo.lastname))) {
                        //creation du compte
                        return accountSet(datas);
                    } else {
                        log4n.error('user must be admin or account owner for this action');
                        return errorparsing({error_code: 403});
                    }
                }
            })
            .then(datas => {
                //recherche d'un code erreur précédent
                if (typeof datas.error_code === 'undefined') {
                    //notification enregistrée
                    res.status(201).send(datas);
                    log4n.debug('done - ok');
                } else {
                    //erreur dans le processus d'enregistrement de la notification
                    responseError(datas, res, log4n);
                    log4n.debug('done - response error');
                }
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - promise catch');
            });
    } catch (exception) {
        if (exception.message === "403") {
            responseError({error_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError({error_code: 500}, res, log4n);
        }
    }
};
