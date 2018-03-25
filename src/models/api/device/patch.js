const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoClient = require('../../mongodbupdate.js');
const Converter = require('./converter.js');

module.exports = function (device_id, new_device) {
    const log4n = new Log4n('/models/api/device/patch');
    // log4n.object(device_id,'device_id');
    // log4n.object(new_device,'new_device');

    //traitement de recherche dans la base
    return new Promise(function (resolve, reject) {
        try{
            log4n.debug('storing device');
            let converter = new Converter();
            if (typeof device_id === 'undefined' || typeof new_device === 'undefined') {
                reject(errorparsing({error_code: 400}));
                log4n.debug('done - missing paramater')
            } else {
                let query = {};
                log4n.debug('preparing datas');
                query.id = device_id;
                //au cas ou on usurperait le device
                converter.json2db(new_device)
                    .then(parameter => {
                        // log4n.object(parameter,'parameter');
                        return mongoClient('device', query, parameter);
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            log4n.debug('done - no data');
                            return errorparsing({error_code: 500});
                        } else {
                            if (typeof datas.error_code === 'undefined') {
                                log4n.debug('done - ok');
                                return converter.db2json(datas);
                            } else {
                                log4n.debug('done - error');
                                return datas;
                            }
                        }
                    })
                    .then(datas => {
                        if (typeof datas.error_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorparsing(datas));
                            log4n.debug('done - error')
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(error));
                        log4n.debug('done - global catch')
                    });
            }
        } catch(error) {
            log4n.object(error, 'error');
            reject(errorparsing(error));
            log4n.debug('done - global catch');
        }
    });
};
