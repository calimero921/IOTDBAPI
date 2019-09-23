const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const get = require('../../../models/api/device/get.js');
const patch = require('../../../models/api/device/patch.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route PATCH /1.0.0/device/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {Device.model} device.body.required - Device details
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/patch');

    try {
        let userInfo = checkAuth(req, res);

        let id = req.params.id;
        log4n.object(id, 'id');

        if (typeof id === 'undefined') {
            responseError({error_code: 400}, res, log4n);
            log4n.debug('done - missing arguments')
        } else {
            let updatedata;
            decodePost(req, res)
                .then(datas => {
                    //log4n.object(datas, 'datas');
                    updatedata = datas;
                    //supprime les champs id, user_id, manufacturer, model, secrial et secret des données pouvant être mise à jour
                    if (typeof updatedata.id != 'undefined') {
                        delete updatedata.id;
                    }
                    if (typeof updatedata.user_id != 'undefined') {
                        delete updatedata.user_id;
                    }
                    if (typeof updatedata.manufacturer != 'undefined') {
                        delete updatedata.manufacturer;
                    }
                    if (typeof updatedata.model != 'undefined') {
                        delete updatedata.model;
                    }
                    if (typeof updatedata.serial != 'undefined') {
                        delete updatedata.serial;
                    }
                    if (typeof updatedata.secret != 'undefined') {
                        delete updatedata.secret;
                    }
                    return get({id: id}, 0, 0, false)
                })
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas.error_code === 'undefined') {
                        if (userInfo.admin || (datas.user_id === userInfo.id)) {
                            log4n.object(updatedata, 'updatedata');
                            let newdata = datas[0];
                            if (typeof newdata != 'undefined') {
                                for (let key in updatedata) {
                                    log4n.object(key, 'key');
                                    newdata[key] = updatedata[key];
                                }
                                log4n.object(newdata, 'newdata');
                                return patch(id, newdata)
                            } else {
                                return {error_code: '403', error_message: 'Forbidden'};
                            }
                        } else {
                            return {error_code: '404', error_message: 'Not found'};
                        }
                    } else {
                        return datas;
                    }
                })
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        responseError({error_code: 500}, res, log4n);
                        log4n.debug('done - internal server error');
                    } else {
                        if (typeof datas.error_code === 'undefined') {
                            res.status(200).send(datas);
                            log4n.debug('done - ok');
                        } else {
                            responseError(datas, res, log4n);
                            log4n.debug('done - response error');
                        }
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
