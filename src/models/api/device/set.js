const Moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const mongoInsert = require('../../mongodbinsert.js');
const Converter = require('./converter.js');
const Generator = require('../generator.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, device) {
    const log4n = new Log4n(context, '/models/api/device/set');
    // log4n.object(device, 'device');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.debug('storing device');
            const generator = new Generator(context);
            const converter = new Converter(context);
            if (typeof device === 'undefined') {
                reject(errorparsing({status_code: '400', status_message: 'Missing parameter'}));
                log4n.log('done - missing parameter');
            } else {
                log4n.debug('preparing datas');
                //ajout des informations générées par le serveur
                device.device_id = generator.idgen();
                device.key = generator.keygen();
                device.creation_date = parseInt(Moment().format('x'));
                device.last_connexion_date = parseInt(Moment().format('x'));
                converter.json2db(device)
                    .then(query => {
                        log4n.object(query, 'query');
                        return mongoInsert(context, 'device', query);
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