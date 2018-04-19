const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const accountGetByID = require('../../../models/api/account/getByID.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/get');
    // log4n.object(req.params.id,'id');
    var id = req.params.id;

    //traitement de recherche dans la base
    if (typeof id === 'undefined') {
        //aucun id
        responseError({error_code: 400}, res, log4n);
        log4n.debug('done - missing parameter');
    } else {
        //traitement de recherche dans la base
        accountGetByID(id)
            .then(datas => {
                if (typeof datas === 'undefined') {
                    responseError({error_code: 404}, res, log4n);
                    log4n.debug('done - not found');
                } else {
                    // log4n.object(datas, 'datas');
                    res.status(200).send(datas);
                    log4n.debug('done - ok');
                }
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - global catch');
            });
    }
};
