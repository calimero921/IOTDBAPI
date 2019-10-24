const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const get = require('../../../models/api/device/get.js');
const patch = require('../../../models/api/device/patch.js');

const Log4n = require('../../../utils/log4n.js');
const errorParsing = require('../../../utils/errorparsing.js');
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
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/device/patch');

    try {
        let userInfo = checkAuth(context, req, res);

        let device_id = req.params.id;
        // log4n.object(device_id, 'id');

        if (typeof device_id === 'undefined') {
            responseError(context, {status_code: 400}, res, log4n);
            log4n.debug('done - missing arguments')
        } else {
            let newData;
            decodePost(context, req, res)
                .then(datas => {
                    //log4n.object(datas, 'datas');
                    newData = datas;
                    return get(context, {device_id: device_id}, 0, 0, false)
                })
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        return errorParsing(context, {status_code: 500, status_message: 'no data'})
                    } else {
                        if (typeof datas.status_code === 'undefined') {
                            if (userInfo.admin || (datas.user_id === userInfo.id)) {
                                if (datas.length > 0) {
                                    return patch(context, datas[0].device_id, newData);
                                } else {
                                    return errorParsing(context, {status_code: 404});
                                }
                            } else {
                                return {status_code: '403'};
                            }
                        } else {
                            return datas;
                        }
                    }
                })
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        responseError(context, {status_code: 500}, res, log4n);
                        log4n.debug('done - internal server error');
                    } else {
                        if (typeof datas.status_code === 'undefined') {
                            res.status(200).send(datas);
                            log4n.debug('done - ok');
                        } else {
                            responseError(context, datas, res, log4n);
                            log4n.debug('done - response error');
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
