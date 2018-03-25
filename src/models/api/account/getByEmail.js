const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const accountGet = require('./get.js');

module.exports = function (email) {
    const log4n = new Log4n('/models/api/account/getByEmail');
    log4n.object(email, 'email');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        if (typeof email === 'undefined') {
            reject(errorparsing({error_code: 400}));
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            let query = {email: email};
            accountGet(query, 0, 0)
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
