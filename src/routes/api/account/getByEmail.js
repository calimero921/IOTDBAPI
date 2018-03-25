const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const getByEmail = require('../../../models/api/account/getByEmail.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/getByEmail');
    log4n.object(req.params.email, 'email');

    //traitement de recherche dans la base
    if (typeof req.params.email === 'undefined') {
        responseError({error_code: 400}, res, log4n);
        log4n.debug('done - missing parameter');
    } else {
        //traitement de recherche dans la base
        getByEmail(req.params.email)
            .then(datas => {
                // log4n.object(datas, 'datas');
                res.status(200).send(datas);
                log4n.debug('done - ok');
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - global catch');
            });
    }
};