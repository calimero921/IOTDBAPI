const Log4n = require('../../utils/log4n.js');
const mongoDelete = require('../../connectors/mongodb/deleteall.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, device_id) {
    const log4n = new Log4n(context, '/models/device/delete');
    // log4n.object(device_id,'device_id');

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        let query = {};
        if (typeof device_id === 'undefined') {
            reject(errorparsing(context, {status_code: 400}));
            log4n.debug('done - missing paramater');
        } else {
            query.device_id = device_id;
            mongoDelete(context, 'event', query)
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        reject(errorparsing(context, {status_code: 500}));
                        log4n.debug('done - no reult');
                    } else {
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorparsing(context, datas));
                            log4n.debug('done - response error');
                        }
                    }
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    reject(errorparsing(context, error));
                    log4n.debug('done - promise catch')
                });
        }
    });
};
