const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const accountGet = require('./get.js');

module.exports = function (session_id, overtake) {
    const log4n = new Log4n('/models/api/account/getBySession');
    log4n.object(session_id, 'session_id');
    log4n.object(overtake, 'overtake');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        if (typeof overtake === 'undefined') overtake = false;
        if (typeof session_id === 'undefined') {
            reject(errorparsing({error_code: 400}));
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            accountGet({session_id: session_id}, 0, 0, overtake)
                .then(datas => {
                    if (typeof datas === 'undefined') {
                        reject(errorparsing({error_code: 404}));
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
