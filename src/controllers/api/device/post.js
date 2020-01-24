const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const set = require('../../../models/api/device/set.js');
const get = require('../../../models/api/device/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route POST /1.0.0/device
 * @group Device - Operations about device
 * @param {Device.model} device.body.required - Device details
 * @returns {Device.model} 201 - Device info
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/device/post');

    try {
        let userInfo = checkAuth(context, req, res);

        let postData;
        //lecture des données postées
        decodePost(context, req, res)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    //aucune donnée postée
                    return {status_code: 400};
                } else {
                    postData = datas;
                    //lecture des données postées
                    if (userInfo.admin || userInfo.id === postData.user_id) {
                        let query = {
                            manufacturer: postData.manufacturer,
                            model: postData.model,
                            serial: postData.serial,
                            secret: postData.secret
                        };
                        return get(context, query, 0, 0, true);
                    } else {
                        return {status_code: '403'};
                    }
                }
            })
            .then(datas => {
                log4n.object(datas, 'get datas');
                if (typeof datas === 'undefined') {
                    //aucune données recue du processus d'enregistrement
                    return {status_code: 500, status_message: 'No datas'};
                } else {
                    if (typeof datas.status_code === "undefined") {
                        //le device est déjà présent
                        return {status_code: 409};
                    } else {
                        if (datas.status_code === 404) {
                            if (typeof postData.user_id === 'undefined') {
                                postData.user_id = userInfo.id;
                            }
                            return set(context, postData);
                        } else {
                            return datas;
                        }
                    }
                }
            })
            .then(datas => {
                log4n.object(datas, 'set datas');
                if (typeof datas === 'undefined') {
                    //aucune données recue du processus d'enregistrement
                    responseError(context, {status_code: 500}, res, log4n);
                    log4n.debug('done - no data');
                } else {
                    //recherche d'un code erreur précédent
                    if (typeof datas.status_code === 'undefined') {
                        //notification enregistrée
                        res.status(201).send(datas);
                        log4n.debug('done - ok');
                    } else {
                        //erreur dans le processus d'enregistrement de la notification
                        responseError(context, datas, res, log4n);
                        log4n.debug('done - response error');
                    }
                }
            })
            .catch(error => {
                responseError(context, error, res, log4n);
                log4n.debug('done - global catch');
            });
    } catch (exception) {
        if (exception.message === "403") {
            responseError(context, {status_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError(context, {status_code: 500}, res, log4n);
        }
    }
};
