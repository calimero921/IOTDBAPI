const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');
const connexion = require('./mongoconnexion.js');
const mongoerror = require('./mongodberror.js');

module.exports = function (collection, query) {
    const log4n = new Log4n('/models/mongodbinsert');
    log4n.object(collection, 'collection');
    log4n.object(query, 'query');

    return new Promise(function (resolve, reject) {
        connexion()
            .then(() => {
                try {
                    let mdbcollection = mongodbConnexion.collection(collection);
                    mdbcollection.insertOne(query)
                        .then(datas => {
                            // console.log('datas: ', datas);
                            if (typeof datas === 'undefined') {
                                reject(errorparsing({error_code: 500}));
                                log4n.debug('done - no data');
                            } else {
                                if (datas.result.ok === 1) {
                                    if (typeof datas.ops === 'undefined') {
                                        reject(errorparsing({error_code: 500}));
                                        log4n.debug('done - no response');
                                    } else {
                                        resolve(datas.ops);
                                        log4n.debug('done - ok');
                                    }
                                } else {
                                    reject(errorparsing({error_code: 500}));
                                    log4n.debug('done - response error');
                                }
                            }
                        })
                        .catch((error) => {
                            // log4n.object(error, 'error');
                            reject(mongoerror(error));
	                        global.mongodbConnexion = null;
                            log4n.debug('done - mongo catch')
                        });
                } catch (error) {
                    console.log('error:', error);
                    reject(errorparsing(error));
                    log4n.debug('done - try catch')
                }
            })
            .catch((error) => {
                log4n.object(error, 'error');
                reject(errorparsing(error));
                log4n.debug('done - global catch')
            });
    });
};