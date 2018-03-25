const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const accountGet = require('./get.js');

module.exports = function (email, token) {
    const log4n = new Log4n('/models/api/account/getByToken');
    log4n.object(token, 'token');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        if (typeof token === 'undefined') {
            reject(errorparsing({error_code: 400}));
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            accountGet({email: email, token: token}, 0, 0, true)
                .then(datas => {
                    if (typeof datas === 'undefined') {
                        reject(errorparsing({error_code: 403}));
                        log4n.debug('done - not found');
                    } else {
                        // log4n.object(datas, 'datas');
                        resolve(datas);
                        log4n.debug('done - ok');
                    }
                })
                .catch(error => {
                    reject(errorparsing(error));
                    log4n.debug('done - promise catch');
                });
        }
    });
};
