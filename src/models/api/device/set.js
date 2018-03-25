const Moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoClient = require('../../mongodbinsert.js');
const Converter = require('./converter.js');
const Generator = require('../generator.js');

module.exports = function (device) {
    const log4n = new Log4n('/models/api/device/set');
    log4n.object(device, 'device');

    //traitement d'enregistrement dans la base
    return new Promise(function (resolve, reject) {
        try{
            log4n.debug('storing device');
            const generator = new Generator();
            const converter = new Converter();
            if (typeof device === 'undefined') {
                reject(errorparsing({error_code: '400'}));
                log4n.log('done - missing parameter');
            } else {
                log4n.debug('preparing datas');
                converter.json2db(device)
                    .then(query => {
                        //ajout des informations générées par le serveur
                        query.id = generator.idgen();
                        query.key = generator.keygen();
                        query.creation_date = parseInt(Moment().format('x'));
                        query.last_connexion_date = parseInt(Moment().format('x'));
                        log4n.object(query, 'query');
                        return mongoClient('device', query);
                    })
                    .then(datas => {
                        // console.log('datas: ', datas);
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            return(errorparsing({error_code: '500'}));
                        } else {
                            return converter.db2json(datas[0]);
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            reject(errorparsing({error_code: '500'}));
                        } else {
                            if(typeof datas.error_code === "undefined") {
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
                        reject(errorparsing(error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch(error) {
            log4n.object(error, 'error');
            reject(errorparsing(error));
            log4n.debug('done - global catch');
        }
    });
};