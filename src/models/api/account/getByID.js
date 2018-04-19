const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const accountGet = require('./get.js');

module.exports = function (id, overtake) {
    const log4n = new Log4n('/models/api/account/getByID');
    log4n.object(id, 'id');
	log4n.object(overtake, 'overtake');
	if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        if (typeof id === 'undefined') {
            reject(errorparsing({error_code: 400}));
            log4n.debug('done - missing parameter');
        } else {
            //traitement de recherche dans la base
            let query = {id: id};
            accountGet(query, 0, 0, overtake)
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
