const Log4n = require('../../../utils/log4n.js');
const remove = require('../../../models/api/device/delete.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route DELETE /1.0.0/device/{id}
 * @group Device - Operations about device
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @returns {Error} 204
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/delete');
    // log4n.object(req.params.id,'id');

    let id = req.params.id;

    //traitement de recherche dans la base
    if (typeof id === 'undefined') {
        //aucun id
        let error = {error_code: 400};
        responseError(error, res, log4n);
    } else {
        //traitement de suppression dans la base
        remove(id)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (typeof datas === 'undefined') {
                    return {error_code: 404};
                } else {
                    if (typeof datas.error_code === 'undefined') {
                        res.status(204).send();
                        log4n.debug('done');
                    } else {
                        responseError(datas.error_code, res, log4n);
                        log4n.debug('done');
                    }
                }
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done');
            });
    }
};