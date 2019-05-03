const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const deviceGet = require('../../../models/api/device/get.js');

const errorparsing = require('../../../utils/errorparsing.js');
const responseError = require('../../../utils/responseError.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/get');

    try {
        let userInfo = checkAuth(req, res);

        log4n.object(req.params.id, 'id');
        let id = req.params.id;

        //traitement de recherche dans la base
        if (typeof id === 'undefined') {
            //aucun device_id
            responseError(errorparsing({error_code: 400}), res, log4n);
            log4n.debug('done - missing parameter(device_id)');
        } else {
            let query = {id: id};
            if (!userInfo.admin) {
                query.user_id = userInfo.id;
            }
            //traitement de recherche dans la base
            deviceGet(query, 0, 0)
                .then(datas => {
                    if (typeof datas === 'undefined') {
                        responseError(errorparsing({error_code: 404}), res, log4n);
                        log4n.debug('done - not found');
                    } else {
                        // log4n.object(datas, 'datas');
                        res.status(200).send(datas[0]);
                        log4n.debug('done - ok');
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
