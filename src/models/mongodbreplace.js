const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');
const connexion = require('./mongoconnexion.js');

module.exports = function (collection, query, parameter) {
    const log4n = new Log4n('/models/mongodbreplace');
    // log4n.object(collection, 'collection');
    // log4n.object(query, 'query');
    // log4n.object(parameter, 'parameter');

    return new Promise(function (resolve, reject) {
        connexion()
            .then(() => {
            try {
                let mdbcollection = mongodbConnexion.collection(collection);
                mdbcollection.findOneAndReplace(
                    query,
                    parameter,
                    {
                        returnOriginal: false,
                        upsert: true
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas === 'undefined') {
                            reject(errorparsing({error_code: 500}));
                            log4n.debug('done - no data');
                        } else {
                            if (datas.ok === 1) {
                                if (typeof datas.value === 'undefined') {
                                    reject(errorparsing({error_code: 500}));
                                    log4n.debug('done - no response');
                                } else {
                                    resolve(datas.value);
                                    log4n.debug('done - ok');
                                }
                            } else {
                                reject(errorparsing({error_code: 500}));
                                log4n.debug('done - response error');
                            }
                        }
                    })
                    .catch((error) => {
                        log4n.object(error, 'error');
                        reject(errorparsing(error));
	                    global.mongodbConnexion = null;
                        log4n.debug('done - call catch')
                    });
            } catch (error) {
                log4n.object(error, 'error');
                reject(errorparsing(error));
                log4n.debug('done - global catch')
            }
        });
    });
};