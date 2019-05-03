const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../checkAuth.js');
const accountDelete = require('../../../models/api/account/delete.js');

const responseError = require('../../../utils/responseError.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/delete');

    try {
        let userInfo = checkAuth(req, res);

        // log4n.object(req.params.id,'id');
        let id = req.params.id;
        let token = req.params.token;

        //traitement de recherche dans la base
        if (typeof req.params.id === 'undefined' || typeof req.params.token === 'undefined') {
            responseError({error_code: 400}, res, log4n);
        } else {
            if (userInfo.admin || (id === userInfo.id)) {
                //traitement de suppression dans la base
                accountDelete(id, token)
                    .then(data => {
                        // log4n.object(datas, 'datas');
                        res.status(204).send();
                        log4n.debug('done - ok');
                    })
                    .catch(error => {
                        responseError(error, res, log4n);
                        log4n.debug('done - promise catch');
                    });
            } else {
                log4n.error('user must be admin or account owner for this action');
                return errorparsing({error_code: 403});
            }
        }
    } catch (exception) {
        if (exception.message === "403") {
            responseError({error_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError({error_code: 500}, res, log4n);
        }
    }
};