const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const responseError = require('../../../utils/responseError.js');
const get = require('../../../models/api/device/get.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/exists');
    log4n.object(req.params.manufacturer,'manufacturer');
    let manufacturer = req.params.manufacturer;
    log4n.object(req.params.model,'model');
    let model = req.params.model;
    log4n.object(req.params.serial,'serial');
    let serial = req.params.serial;
    log4n.object(req.params.secret,'secret');
    let secret = req.params.secret;

    //traitement de recherche dans la base
    if (typeof manufacturer === 'undefined' || typeof model === 'undefined' || typeof serial === 'undefined' || typeof secret === 'undefined') {
        //informations manquantes
        responseError(errorparsing({error_code: 400}), res, log4n);
        log4n.debug('done - missing parameter');
    } else {
        //traitement de recherche dans la base
        let query = {manufacturer:manufacturer, model:model, serial:serial, secret:secret};
        get(query, 0, 0, false)
            .then(datas => {
                if (typeof datas === 'undefined') {
                    responseError(errorparsing({error_code: 404}), res, log4n);
                    log4n.debug('done - not found');
                } else {
                    // log4n.object(datas, 'datas');
                    res.status(200).send(datas[0]);
                    log4n.debug('done - ok');
                }
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - global catch');
            });
    }
};
