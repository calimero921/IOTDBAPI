const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const getBySession = require('../../../models/api/account/getBySession.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/getBySession');
    log4n.object(req.sessionID, 'session_id');

    //traitement de recherche dans la base
    if (typeof req.sessionID === 'undefined') {
        responseError({error_code: 400}, res, log4n);
        log4n.debug('done - missing parameter');
    } else {
        //traitement de recherche dans la base
        getBySession(req.sessionID)
            .then(datas => {
                    // log4n.object(datas, 'datas');
                    res.status(200).send(datas);
                    log4n.debug('done - ok');
            })
            .catch(error => {
                responseError(error, res, log4n);
                log4n.debug('done - promise catch');
            });
    }
};