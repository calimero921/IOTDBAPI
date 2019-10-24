const connexion = require('./mongoconnexion.js');

const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

module.exports = function (context, converter, collectionName, query, parameters, overtake) {
    return new Promise((resolve, reject) => {
        try {
            const log4n = new Log4n(context, '/models/mongodbfind');
            log4n.object(collectionName, 'collection');
            log4n.object(query, 'query');
            log4n.object(parameters, 'parameter');

            if (typeof overtake === 'undefined') overtake = false;
            log4n.object(overtake, 'overtake');

            connexion(context)
                .then(() => {
                    //initialisation des parametres offset et limit
                    let skip = 0;
                    let limit = 0;
                    let sort = {};
                    if (typeof parameters !== 'undefined') {
                        if (typeof parameters.skip !== 'undefined') skip = parseInt(parameters.skip);
                        if (typeof parameters.limit !== 'undefined') limit = parseInt(parameters.limit);
                        if (typeof parameters.sort !== 'undefined') sort = parameters.sort;
                    }
                    let collection = mongodbConnexion.collection(collectionName);
                    collection.find(query)
                        .skip(skip)
                        .limit(limit)
                        .sort(sort)
                        .toArray()
                        .then(datas => {
                            // console.log('datas: ', datas);
                            if (typeof datas === 'undefined') {
                                reject(errorparsing(context, {status_code: 500}));
                                log4n.debug('done - no data')
                            } else {
                                if (datas.length > 0) {
                                    let promises = [];
                                    for (let idx1 = 0; idx1 < datas.length; idx1++) {
                                        if (datas.hasOwnProperty(idx1)) {
                                            promises.push(converter.db2json(datas[idx1]));
                                        }
                                    }

                                    Promise.all(promises)
                                        .then(result => {
                                            // log4n.object(result, 'result');
                                            if (result.length > 0) {
                                                resolve(result);
                                                log4n.debug('done - ok');
                                            } else {
                                                reject(errorparsing(context, {status_code: 404}));
                                                log4n.debug('done - not correct record found');
                                            }
                                        })
                                        .catch(error => {
                                            reject(errorparsing(context, error));
                                            log4n.debug('done - error')
                                        });
                                } else {
                                    if (overtake) {
                                        resolve(errorparsing(context, {status_code: 404}));
                                        log4n.debug('done - no result but ok')
                                    } else {
                                        reject(errorparsing(context, {status_code: 404}));
                                        log4n.debug('done - not found')
                                    }
                                }
                            }
                        })
                        .catch((error) => {
                            log4n.object(error, 'error');
                            reject(errorparsing(context, error));
                            global.mongodbConnexion = null;
                            log4n.debug('done - find catch')
                        });
                })
                .catch((error) => {
                    log4n.object(error, 'error');
                    reject(errorparsing(context, error));
                    log4n.debug('done - connexion catch')
                });
        } catch (exception) {
            console.log('exception:', exception);
            reject(errorparsing(context, exception));
            log4n.debug('done - exception')
        }
    });
};