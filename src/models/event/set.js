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
const mongoInsert = require('../../connectors/mongodb/insert.js');
const Converter = require('./utils/Converter.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, event) {
    const log4n = new Log4n(context, '/models/event/set');
    log4n.object(event, 'event');

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            log4n.debug('storing device');
            const converter = new Converter(context);
            if (typeof event === 'undefined') {
                reject(errorParsing({status_code: 400, status_message: 'Missing parameter'}));
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
                            return (errorParsing(context, 'No datas'));
                        } else {
                            return converter.db2json(datas[0]);
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas === 'undefined') {
                            reject(errorParsing(context, 'No datas'));
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
                        reject(errorParsing(context, error));
                        log4n.debug('done - promise catch');
                    });
            }
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorParsing(context, error));
            log4n.debug('done - global catch');
        }
    });
};