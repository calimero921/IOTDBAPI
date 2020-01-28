const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const measureGet = require('../../../models/api/event/get.js');
const deviceGet = require('../../../models/api/device/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/event/{device_id}
 * @group Measure - Operations about measure
 * @param {string} device_id.path.required - eg: 778cdaa0-869c-11e8-a13c-0d1008100710
 * @returns {array.<Measure>} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/event/get');

    try {
        let userInfo = checkAuth(context, req, res);

        log4n.object(req.params.id, 'id');
        let device_id = req.params.id;

        //traitement de recherche dans la base
        if (typeof device_id === 'undefined') {
            //aucun device_id
            responseError(context,{status_code: 400}, res, log4n);
            log4n.debug('done - missing parameter(id)');
        } else  {
            let query = {device_id: device_id};
            if (!userInfo.admin) {
                query.user_id = userInfo.id;
            }
            //traitement de recherche dans la base
            deviceGet(context, query, 0, 0)
                .then(datas => {
                    if (typeof datas !== 'undefined') {
                        if (typeof datas.status_code !== 'undefined') {
                            return datas;
                        } else {
                            return measureGet(context, query, 0, 100);
                        }
                    } else {
                        return {status_code: 404};
                    }
                })
                .then(datas => {
                    if (typeof datas === 'undefined') {
                        responseError(context, {status_code: 404}, res, log4n);
                        log4n.debug('done - not found');
                    } else {
                        if (typeof datas.status_code !== 'undefined') {
                            responseError(context, datas, res, log4n);
                            log4n.debug('done - error');
                        } else {
                            // log4n.object(datas, 'datas');
                            res.status(200).send(datas);
                            log4n.debug('done - ok');
                        }
                    }
                })
                .catch(error => {
                    responseError(context, error, res, log4n);
                    log4n.debug('done - global catch');
                });
        }
    } catch (exception) {
        if (exception.message === "403") {
            responseError(context, {status_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError(context, {status_code: 500}, res, log4n);
        }
    }
};
