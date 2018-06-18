const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const accountGet = require('./get.js');

module.exports = function (email, skip, limit, overtake) {
    const log4n = new Log4n('/models/api/account/getByEmail');
    log4n.object(email, 'email');
    log4n.object(skip, 'skip');
    if (typeof skip === 'undefined') skip = 0;
    log4n.object(limit, 'limit');
    if (typeof limit === 'undefined') limit = 0;
    log4n.object(overtake, 'overtake');
    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        if (typeof email === 'undefined') {
            reject(errorparsing({error_code: 400}));
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            let query = {email: email};
            accountGet(query, skip, limit, overtake)
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    resolve(datas);
                    log4n.debug('done - ok');
                })
                .catch(error => {
                    reject(errorparsing(error));
                    log4n.debug('done - promise catch');
                });
        }
    });
};
