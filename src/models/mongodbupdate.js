const connexion = require('./mongoconnexion.js');

const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');

module.exports = function (context, converter, collectionName, query, parameters) {
    return new Promise((resolve, reject) => {
            try {
                const log4n = new Log4n(context, '/models/mongodbupdate');
                // log4n.object(collection, 'collection');
                // log4n.object(query, 'query');
                log4n.object(parameters, 'parameter');

                connexion(context)
                    .then(() => {
                        let collection = mongodbConnexion.collection(collectionName);
                        let operators = {"$set": parameters};
                        let options = {
                            returnOriginal: false,
                            upsert: true
                        };
                        return collection.findOneAndUpdate(query, operators, options);
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas !== 'undefined') {
                            if (datas.ok === 1) {
                                if (typeof datas.value !== 'undefined') {
                                    return converter.db2json(datas.value);
                                } else {
                                    return errorparsing(context, {status_code: 500});
                                }
                            } else {
                                return errorparsing(context, {status_code: 500});
                            }
                        } else {
                            reject(errorparsing(context, {status_code: 500}));
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas !== 'undefined') {
                            if (typeof datas.status_code === 'undefined') {
                                resolve(datas);
                                log4n.debug('done - ok');
                            } else {
                                reject(datas);
                                log4n.debug('done - error');
                            }
                        } else {
                            reject(errorParsing(context, {status_code: 500}));
                            log4n.debug('done - no data');
                        }
                    })
                    .catch((error) => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        global.mongodbConnexion = null;
                        log4n.debug('done - call catch')
                    });
            } catch
                (error) {
                console.log('error:', error);
                reject(errorparsing(context, error));
                log4n.debug('done - global catch')
            }
        }
    )
};