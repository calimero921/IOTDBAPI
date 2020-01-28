const mongoFind = require('../../../connectors/mongodb/find.js');
const mongoUpdate = require('../../../connectors/mongodb/update.js');
const Converter = require('./converter.js');

const Log4n = require('../../../utils/log4n.js');
const errorParsing = require('../../../utils/errorparsing.js');

module.exports = function (context, device_id, new_device) {
    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            const log4n = new Log4n(context, '/models/api/device/patch');
            // log4n.object(context,'context');
            // log4n.object(device_id,'device_id');
            // log4n.object(new_device,'new_device');

            if (typeof device_id === 'undefined' || typeof new_device === 'undefined') {
                reject(errorParsing(context, {status_code: 400}));
                log4n.debug('done - missing paramater')
            } else {
                log4n.debug('preparing datas');

                let update_date;
                let converter = new Converter(context);
                let findQuery = {device_id: device_id};
                let parameter = {limit: 0, offset: 0};
                mongoFind(context, converter, 'device', findQuery, parameter, false)
                    .then(datas => {
                        if (typeof datas === 'undefined') {
                            return errorParsing(context, {status_code: 500});
                        } else {
                            if (typeof datas.status_code === 'undefined') {
                                if (datas.length > 0) {
                                    update_date = datas[0];
                                    return converter.json2db(new_device);
                                } else {
                                    return errorParsing(context, {status_code: 404});
                                }
                            } else {
                                return datas;
                            }
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas,'datas');
                        if (typeof datas === 'undefined') {
                            return errorParsing(context, {status_code: 500});
                        } else {
                            if (typeof datas.status_code === 'undefined') {
                                //supprime les champs id, user_id, manufacturer, model, secrial et secret
                                //des données pouvant être mise à jour au cas ou on usurperait le device
                                if (typeof datas.key !== 'undefined') {
                                    update_date.key = datas.key;
                                }
                                if (typeof datas.name !== 'undefined') {
                                    update_date.name = datas.name;
                                }
                                if (typeof datas.class !== 'undefined') {
                                    update_date.class = datas.class;
                                }
                                if (typeof datas.software_version !== 'undefined') {
                                    update_date.software_version = datas.software_version;
                                }
                                if (typeof datas.local_ip !== 'undefined') {
                                    update_date.local_ip = datas.local_ip;
                                }
                                for (let idx1 in update_date.capabilities) {
                                    if (update_date.capabilities.hasOwnProperty(idx1)) {
                                        for (let idx2 in datas.capabilities) {
                                            if (datas.capabilities.hasOwnProperty(idx2)) {
                                                if (update_date.capabilities[idx1].name === datas.capabilities[idx2].name) {
                                                    if (typeof datas.capabilities[idx2].last_value !== 'undefined') {
                                                        update_date.capabilities[idx1].last_value = datas.capabilities[idx2].last_value;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                update_date.last_connexion_date = datas.last_connexion_date;
                                // log4n.object(update_date, 'update_date');

                                let updateQuery = {device_id: device_id};
                                // log4n.object(updateQuery, 'updateQuery');
                                return mongoUpdate(context, converter, 'device', updateQuery, update_date);
                            } else {
                                return datas;
                            }
                        }

                    })
                    .then(datas => {
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorParsing(context, datas));
                            log4n.debug('done - error')
                        }
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorParsing(context, error));
                        log4n.debug('done - global catch')
                    });
            }
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorParsing(context, error));
            log4n.debug('done - global catch');
        }
    });
};
