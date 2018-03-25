const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const mongoClient = require('../../mongodbdelete.js');

module.exports = function (device_id) {
    const log4n = new Log4n('/models/api/device/delete');
    // log4n.object(device_id,'device_id');

    //traitement de suppression dans la base
    return new Promise(function (resolve, reject) {
        var query = {};
        if(typeof device_id === 'undefined') {
            reject(errorparsing({error_code:400}));
            log4n.debug('done - missing paramater');
        } else {
            query.id = device_id;
            mongoClient('device', query)
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        reject(errorparsing({error_code:500}));
                        log4n.debug('done - no reult');
                    } else {
                        if (typeof datas.error_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorparsing(datas));
                            log4n.debug('done - response error');
                        }
                    }
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    reject(errorparsing(error));
                    log4n.debug('done - promise catch')
                });
        }
    });
};
