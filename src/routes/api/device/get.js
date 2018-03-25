const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const responseError = require('../../../utils/responseError.js');
const get = require('../../../models/api/device/get.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/get');
    log4n.object(req.params.device_id,'id');
    let id = req.params.device_id;

    //traitement de recherche dans la base
    if (typeof id === 'undefined') {
        //aucun device_id
        responseError(errorparsing({error_code: 400}), res, log4n);
        log4n.debug('done - missing parameter(device_id)');
    } else {
        //traitement de recherche dans la base
        var query = {id: id};
        get(query, 0, 0)
            .then(datas => {
                if (typeof datas === 'undefined') {
                    responseError(errorparsing({error_code: 404}), res, log4n);
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
