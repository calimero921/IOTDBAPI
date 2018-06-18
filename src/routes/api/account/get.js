const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const accountGet = require('../../../models/api/account/get.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/get');
    // log4n.object(req.query.skip,'skip');
    let skip = req.query.skip;
    if (typeof skip === 'undefined') skip = 0;
    // log4n.object(req.query.limit,'limit');
    let limit = req.query.limit;
    if (typeof limit === 'undefined') limit = 0;

    //traitement de recherche dans la base
    accountGet({}, skip, limit, false)
        .then(datas => {
            if (typeof datas === 'undefined') {
                responseError({error_code: 404}, res, log4n);
                log4n.debug('done - not found');
            } else {
                // log4n.object(datas, 'datas');
                res.status(200).send(datas);
                log4n.debug('done - ok');
            }
        })
        .catch(error => {
            responseError(error, res, log4n);
            log4n.debug('done - global catch');
        });
};
