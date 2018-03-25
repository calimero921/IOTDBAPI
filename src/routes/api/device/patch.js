const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const decodePost = require('../../../utils/decodePost.js');
const patch = require('../../../models/api/device/patch.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/patch');
    // log4n.object(req.params.device_id,'id');

    var id = req.params.device_id;

    decodePost(req, res)
        .then(datas => {
            // log4n.object(datas, 'datas');
            return patch(id, datas);
        })
        .then(datas => {
            // log4n.object(datas, 'datas');
            if (typeof datas === 'undefined') {
                responseError({error: {code: 500}}, res, log4n);
                log4n.debug('done - internal server error');
            } else {
                if (typeof datas.code === 'undefined') {
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
};
