const Log4n = require('../../../utils/log4n.js');
const remove = require('../../../models/api/event/delete.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route DELETE /1.0.0/event/{device_id}
 * @group Measure - Operations about measure
 * @param {string} device_id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Error} 204
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/event/delete');
    // log4n.object(req.params.id,'id');

    let device_id = req.params.id;

    //traitement de recherche dans la base
    if (typeof device_id === 'undefined') {
        //aucun id
        let error = {status_code: 400};
        responseError(context, error, res, log4n);
    } else {
        //traitement de suppression dans la base
        remove(context, device_id)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    return {status_code: 404};
                } else {
                    if (typeof datas.status_code === 'undefined') {
                        res.status(204).send();
                        log4n.debug('done');
                    } else {
                        responseError(context, datas, res, log4n);
                        log4n.debug('done');
                    }
                }
            })
            .catch(error => {
                responseError(context, error, res, log4n);
                log4n.debug('done');
            });
    }
};