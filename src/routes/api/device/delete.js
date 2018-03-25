const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const remove = require('../../../models/api/device/delete.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/delete');
    // log4n.object(req.params.device_id,'id');

    var id = req.params.device_id;

    //traitement de recherche dans la base
    if (typeof id === 'undefined') {
        //aucun id
        var error = {error: {code: 400}};
        responseError(error, res, log4n);
    } else {
        //traitement de suppression dans la base
        remove(id)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    return {error: {code: 404}};
                } else {
                    if (typeof datas.error === 'undefined') {
                        res.status(204).send();
                        log4n.debug('done');
                    } else {
                        responseError(datas.error, res, log4n);
                        log4n.debug('done');
                    }
                }
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done');
            });
    }
};