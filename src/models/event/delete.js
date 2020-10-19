/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const Log4n = require('../../utils/log4n.js');
const mongoDelete = require('../../connectors/mongodb/deleteall.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, device_id) {
    const log4n = new Log4n(context, '/models/device/delete');
    // log4n.object(device_id,'device_id');

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        let query = {};
        if (typeof device_id === 'undefined') {
            reject(errorParsing(context, {status_code: 400}));
            log4n.debug('done - missing paramater');
        } else {
            query.device_id = device_id;
            mongoDelete(context, 'event', query)
                .then(datas => {
                    // log4n.object(datas, 'datas');
                    if (typeof datas === 'undefined') {
                        reject(errorParsing(context, {status_code: 500}));
                        log4n.debug('done - no reult');
                    } else {
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            log4n.debug('done - ok');
                        } else {
                            reject(errorParsing(context, datas));
                            log4n.debug('done - response error');
                        }
                    }
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    reject(errorParsing(context, error));
                    log4n.debug('done - promise catch')
                });
        }
    });
};
