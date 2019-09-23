const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const deviceGet = require('../../../models/api/device/get.js');

const errorparsing = require('../../../utils/errorparsing.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /1.0.0/device/exists/{manufacturer}/{model}/{serial}/{secret}
 * @group Device - Operations about device
 * @param {string} manufacturer.path.required - eg: edavid
 * @param {string} model.path.required - eg: MS001
 * @param {string} serial.path.required - eg: 0123456789
 * @param {string} secret.path.required - eg: 21C823DC4721EAE56D774D4BE99CBA62
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/exists');

    try {
        let userInfo = checkAuth(req, res);

        log4n.object(req.params.manufacturer, 'manufacturer');
        let manufacturer = req.params.manufacturer;
        log4n.object(req.params.model, 'model');
        let model = req.params.model;
        log4n.object(req.params.serial, 'serial');
        let serial = req.params.serial;

        //traitement de recherche dans la base
        if (typeof manufacturer === 'undefined' || typeof model === 'undefined' || typeof serial === 'undefined' || typeof secret === 'undefined') {
            //informations manquantes
            responseError(errorparsing({error_code: 400}), res, log4n);
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            let query = {manufacturer: manufacturer, model: model, serial: serial, secret: secret};
            deviceGet(query, 0, 0, false)
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
    } catch (exception) {
        if (exception.message === "403") {
            responseError({error_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError({error_code: 500}, res, log4n);
        }
    }
};
