const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const accountGetByEmail = require('../../../models/api/account/getByEmail.js');
const accountDelete = require('../../../models/api/account/delete.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/delete');
    // log4n.object(req.params.id,'id');

    //traitement de recherche dans la base
    if (typeof req.params.id === 'undefined') {
        responseError({error_code: 400}, res, log4n);
    } else {
        //traitement de suppression dans la base
        accountDelete(req.params.id)
            .then(data => {
                // log4n.object(datas, 'datas');
                res.status(204).send();
                log4n.debug('done - ok');
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - promise catch');
            });
    }
};