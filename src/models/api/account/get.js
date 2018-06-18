const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoClient = require('../../mongodbfind.js');
const Converter = require('./converter.js');

module.exports = function (query, skip, limit, overtake) {
    const log4n = new Log4n('/models/api/account/get');
    log4n.object(query, 'query');
    log4n.object(skip, 'skip');
    if (typeof limit === 'undefined') limit = 0;
    log4n.object(limit, 'limit');
    if (typeof skip === 'undefined') skip = 0;
    log4n.object(overtake, 'overtake');

    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        const converter = new Converter();
        let parameter = {"skip" : skip, "limit" : limit};
        mongoClient('account', query, parameter, overtake)
            .then(datas => {
                let result = [];
                if (datas.length > 0) {
                    let promises = [];
                    for (let i = 0; i < datas.length; i++) {
                        promises.push(converter.db2json(datas[i]));
                    }
                    Promise.all(promises)
                        .then(result => {
                            // log4n.object(result, 'result');
                            if (result.length > 0) {
                                log4n.debug('done - ok');
                                resolve(result);
                            } else {
                                log4n.debug('done - not correct record found');
                                reject(errorparsing({error_code: 404}));
                            }
                        })
                        .catch(error => {
                            log4n.object(error, 'error reading data');
                            reject(errorparsing(error));
                        });
                } else {
                    if (overtake) {
                        // log4n.debug('no result but ok');
                        resolve(result);
                        log4n.debug('done - no result but ok');
                    } else {
                        reject(errorparsing({error_code: 404}));
                        log4n.debug('done - not found');
                    }
                }
            })
            .catch(error => {
                log4n.object(error, 'error');
                reject(errorparsing(error));
                log4n.debug('done - global catch')
            });
    });
};
