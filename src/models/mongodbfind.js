const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');
const connexion = require('./mongoconnexion.js');

module.exports = function (context, collection, query, parameter, overtake) {
    const log4n = new Log4n(context, '/models/mongodbfind');
    log4n.object(collection, 'collection');
    log4n.object(query, 'query');
    log4n.object(parameter, 'parameter');
    log4n.object(overtake, 'overtake');

    if (typeof overtake === 'undefined') overtake = false;

    return new Promise((resolve, reject) => {
        connexion(context)
            .then(() => {
                try {
                    //initialisation des parametres offset et limit
                    let skip = 0;
                    let limit = 0;
                    if (typeof parameter !== 'undefined') {
                        if (typeof parameter.skip !== 'undefined') skip = parseInt(parameter.skip);
                        if (typeof parameter.limit !== 'undefined') limit = parseInt(parameter.limit);
                    }
                    let mdbcollection = mongodbConnexion.collection(collection);
                    mdbcollection.find(query)
                        .skip(skip)
                        .limit(limit)
                        .toArray()
                        .then(datas => {
                            // console.log('datas: ', datas);
                            if (typeof datas === 'undefined') {
                                reject(errorparsing(context, {error_code: 500}));
                                log4n.debug('done - no data')
                            } else {
                                let result = [];
                                if (datas.length > 0) {
                                    for (let i = 0; i < datas.length; i++) {
                                        result.push(datas[i]);
                                    }
                                    // log4n.object(result, 'result');
                                    resolve(result);
                                    log4n.debug('done - ok');
                                } else {
                                    if (overtake) {
                                        resolve(result);
                                        log4n.debug('done - no result but ok')
                                    } else {
                                        reject(errorparsing(context, {error_code: 404}));
                                        log4n.debug('done - not found')
                                    }
                                }
                            }
                        })
                        .catch((error) => {
                            log4n.object(error, 'error');
                            reject(errorparsing(context, error));
                            global.mongodbConnexion = null;
                            log4n.debug('done - promise catch')
                        });
                } catch (error) {
                    console.log('error:', error);
                    reject(errorparsing(context, error));
                    log4n.debug('done - global catch')
                }
            })
            .catch((error) => {
                log4n.object(error, 'error');
                reject(errorparsing(context, error));
                log4n.debug('done - connexion catch')
            });
    });
};