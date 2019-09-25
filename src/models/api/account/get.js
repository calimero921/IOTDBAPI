const Log4n = require('../../../utils/log4n.js');
const mongoClient = require('../../mongodbfind.js');
const Converter = require('./converter.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, query, skip, limit, overtake) {
    const log4n = new Log4n(context, '/models/api/account/get');
    log4n.object(query, 'query');
    log4n.object(skip, 'skip');
    if (typeof limit === 'undefined') limit = 0;
    log4n.object(limit, 'limit');
    if (typeof skip === 'undefined') skip = 0;
    log4n.object(overtake, 'overtake');

    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        const converter = new Converter(context);
        let parameter = {"skip" : skip, "limit" : limit};
        mongoClient(context,'account', query, parameter, overtake)
            .then(datas => {
                let result = [];
                if (datas.length > 0) {
                    let promises = [];
                    for (let i = 0; i < datas.length; i++) {
                        promises.push(converter.db2json(datas[i]));
                    }
                    Promise.all(promises)
                        .then(results => {
                            // log4n.object(results, 'results');
                            if (results.length > 0) {
                                log4n.debug('done - ok');
                                resolve(results);
                            } else {
                                log4n.debug('done - not correct record found');
                                reject(errorparsing(context, {error_code: 404}));
                            }
                        })
                        .catch(error => {
                            log4n.object(error, 'error reading data');
                            reject(errorparsing(context, error));
                        });
                } else {
                    if (overtake) {
                        // log4n.debug('no result but ok');
                        resolve(result);
                        log4n.debug('done - no result but ok');
                    } else {
                        reject(errorparsing(context, {error_code: 404}));
                        log4n.debug('done - not found');
                    }
                }
            })
            .catch(error => {
                log4n.object(error, 'error');
                reject(errorparsing(context, error));
                log4n.debug('done - global catch')
            });
    });
};
