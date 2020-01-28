const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const deviceGet = require('../../../models/device/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route GET /v0/device/user/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - user id - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Device.model} 200 - Device info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/device/getByUser');

    try {
        let userInfo = checkAuth(context, req, res);

        log4n.object(req.params.id, 'id');
        let user_id = req.params.id;

        //traitement de recherche dans la base
        if (typeof user_id === 'undefined') {
            //aucun user_id
            responseError(context, {status_code: 400}, res, log4n);
            log4n.debug('done - missing parameter(user_id)');
        } else {
            if (userInfo.admin || user_id === userInfo.id) {
                //traitement de recherche dans la base
                let query = {user_id: user_id};
                deviceGet(context, query, 0, 0)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            responseError(context, {status_code: 404}, res, log4n);
                            log4n.debug('done - not found');
                        } else {
                            // log4n.object(datas, 'datas');
                            res.status(200).send(datas[0]);
                            log4n.debug('done - ok');
                        }
                    })
                    .catch(error => {
                        responseError(context, error, res, log4n);
                        log4n.debug('done - global catch');
                    });
            } else {
                responseError(context, {
                    status_code: 403,
                    status_message: 'user must be admin or device owner for this action'
                }, res, log4n);
            }
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
