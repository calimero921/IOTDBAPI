const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const deviceGet = require('../../../models/device/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/device/exists/{manufacturer}/{model}/{serial}/{secret}
 * @group Device - Operations about device
 * @param {String} manufacturer.path.required - eg: edavid
 * @param {String} model.path.required - eg: MS001
 * @param {String} serial.path.required - eg: 0123456789
 * @param {String} secret.path.required - eg: 21C823DC4721EAE56D774D4BE99CBA62
 * @returns {Object} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/device/exists');

    try {
        let userInfo = checkAuth(context, req, res);

        let manufacturer = req.params.manufacturer;
        log4n.object(manufacturer, 'manufacturer');
        let model = req.params.model;
        log4n.object(model, 'model');
        let serial = req.params.serial;
        log4n.object(serial, 'serial');
        let secret = req.params.secret;
        log4n.object(secret, 'secret');

        //traitement de recherche dans la base
        if (typeof manufacturer === 'undefined' || typeof model === 'undefined' || typeof serial === 'undefined' || typeof secret === 'undefined') {
            //informations manquantes
            responseError(context, {status_code: 400, status_message: 'Missing parameters'}, res, log4n);
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            let query = {manufacturer: manufacturer, model: model, serial: serial, secret: secret};
            deviceGet(context, query, 0, 0, false)
                .then(datas => {
                    if (typeof datas === 'undefined') {
                        responseError(context, {status_code: 404}, res, log4n);
                        log4n.debug('done - not found');
                    } else {
                        // log4n.object(datas, 'datas');
                        res.status(200).send({device_id: datas[0].device_id});
                        log4n.debug('done - ok');
                    }
                })
                .catch(error => {
                    responseError(context, error, res, log4n);
                    log4n.debug('done - global catch');
                });
        }
    } catch (exception) {
        log4n.error(exception.stack);
        responseError(context, exception, res, log4n);
    }
};
