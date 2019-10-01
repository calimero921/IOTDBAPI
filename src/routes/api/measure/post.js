const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const set = require('../../../models/api/measure/set.js');
const update = require('../../../models/api/device/patch.js');
const get = require('../../../models/api/device/get.js');
const errorparsing = require('../../../utils/errorparsing.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route POST /1.0.0/measure
 * @group Measure - Operations about measure
 * @param {Measure.model} measure.body.required - Device details
 * @returns {Measure.model} 201 - Device info
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/measure/post');

    try {
        let userInfo = checkAuth(context, req, res);

        let postData;
        let device;
        //lecture des données postées
        decodePost(context, req, res)
            .then(datas => {
                log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    //aucune donnée postée
                    return {error_code: 400};
                } else {
                    postData = datas;
                    //lecture des données postées
                    if (userInfo.admin || userInfo.id === postData.user_id) {
                        let query = {device_id: postData.device_id};
                        return get(context, query, 0, 0, true);
                    } else {
                        return {error_code: '403'};
                    }
                }
            })
            .then(datas => {
                // log4n.object(datas, 'get device');
                if (typeof datas === 'undefined') {
                    //aucune données recue du processus d'enregistrement
                    return {error_code: 500, error_message: 'No datas'};
                } else {
                    if (typeof datas.error_code === "undefined") {
                        device = datas[0];
                        return set(context, postData);
                    } else {
                        return datas;
                    }
                }
            })
            .then(datas => {
                // log4n.object(datas, 'set measure');
                if (typeof datas === 'undefined') {
                    //aucune données recue du processus d'enregistrement
                    return {error_code: 500, error_message: 'No datas'};
                } else {
                    if (typeof datas.error_code === "undefined") {
                        postData = datas;
                        return updateDevice(context, device, postData);
                    } else {
                        return datas;
                    }
                }
            })
            .then(datas => {
                // log4n.object(datas, 'set measure');
                if (typeof datas === 'undefined') {
                    //aucune données recue du processus d'enregistrement
                    return {error_code: 500, error_message: 'No datas'};
                } else {
                    if (typeof datas.error_code === "undefined") {
                        return update(context, postData.device_id, datas);
                    } else {
                        return datas;
                    }
                }
            })
            .then(datas => {
                // log4n.object(datas, 'update device');
                if (typeof datas === 'undefined') {
                    //aucune données recue du processus d'enregistrement
                    responseError(context, {error_code: 500}, res, log4n);
                    log4n.debug('done - no data');
                } else {
                    //recherche d'un code erreur précédent
                    if (typeof datas.error_code === 'undefined') {
                        //notification enregistrée
                        res.status(201).send(postData);
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
        log4n.error(exception.stack);
        responseError(context, {error_code: 500}, res, log4n);
    }
};

function updateDevice(context, device, measure) {
    const log4n = new Log4n(context, '/routes/api/measure/post/updateDevice');

    return new Promise((resolve, reject) => {
        // log4n.object(device, 'device');
        // log4n.object(measure, 'measure');

        try {
            for (let idx1 = 0; idx1 < measure.capabilities.length; idx1++) {
                if (typeof measure.capabilities[idx1].value !== 'undefined') {
                    for (let idx2 = 0; idx2 < device.capabilities.length; idx2++) {
                        if (device.capabilities[idx2].name === measure.capabilities[idx1].name) {
                            device.capabilities[idx2].last_value = measure.capabilities[idx1].value;
                        }
                    }
                }
            }

            // log4n.object(device, 'device');
            log4n.debug('done - ok');
            resolve(device);
        } catch (exception) {
            log4n.error(exception.stack);
            log4n.debug('done - error');
            reject(errorparsing (context, exception));
        }
    });
}