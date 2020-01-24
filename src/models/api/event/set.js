const Log4n = require('../../../utils/log4n.js');
const mongoInsert = require('../../../connectors/mongodb/mongodbinsert.js');
const Converter = require('./converter.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, event) {
    const log4n = new Log4n(context, '/models/api/event/set');
    log4n.object(event, 'event');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.debug('storing device');
            const converter = new Converter(context);
            if (typeof event === 'undefined') {
                reject(errorparsing({status_code: '400', status_message: 'Missing parameter'}));
                log4n.log('done - missing parameter');
            } else {
                log4n.debug('preparing datas');
                converter.json2db(event)
                    .then(query => {
                        //ajout des informations générées par le serveur
                        log4n.object(query, 'query');
                        return mongoInsert(context, 'event', query);
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            return (errorparsing(context, 'No datas'));
                        } else {
                            return converter.db2json(datas[0]);
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            reject(errorparsing(context, 'No datas'));
                            log4n.debug('done - no data');
                        } else {
                            if (typeof datas.status_code === "undefined") {
                                resolve(datas);
                                log4n.debug('done - ok');
                            } else {
                                reject(datas);
                                log4n.debug('done - wrong data');
                            }
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(context, error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorparsing(context, error));
            log4n.debug('done - global catch');
        }
    });
};