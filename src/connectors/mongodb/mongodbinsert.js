const Log4n = require('../../utils/log4n.js');
const connexion = require('./mongoconnexion.js');
const mongoerror = require('./mongodberror.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, collection, query) {
    const log4n = new Log4n(context, '/models/mongodbinsert');
    log4n.object(collection, 'collection');
    log4n.object(query, 'query');

    return new Promise((resolve, reject) => {
        connexion(context)
            .then(() => {
                try {
                    let mdbcollection = mongodbConnexion.collection(collection);
                    mdbcollection.insertOne(query)
                        .then(datas => {
                            // console.log('datas: ', datas);
                            if (typeof datas === 'undefined') {
                                reject(errorparsing(context, {status_code: 500}));
                                log4n.debug('done - no data');
                            } else {
                                if (datas.result.ok === 1) {
                                    if (typeof datas.ops === 'undefined') {
                                        reject(errorparsing(context, {status_code: 500}));
                                        log4n.debug('done - no response');
                                    } else {
                                        resolve(datas.ops);
                                        log4n.debug('done - ok');
                                    }
                                } else {
                                    reject(errorparsing(context, {status_code: 500}));
                                    log4n.debug('done - response error');
                                }
                            }
                        })
                        .catch((error) => {
                            // log4n.object(error, 'error');
                            reject(mongoerror(context, error));
	                        global.mongodbConnexion = null;
                            log4n.debug('done - mongo catch')
                        });
                } catch (error) {
                    console.log('error:', error);
                    reject(errorparsing(context, error));
                    log4n.debug('done - try catch')
                }
            })
            .catch((error) => {
                log4n.object(error, 'error');
                reject(errorparsing(context, error));
                log4n.debug('done - global catch')
            });
    });
};