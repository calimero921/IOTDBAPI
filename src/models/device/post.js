/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2023 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const mongoInsert = require('../../Libraries/MongoDB/api/insert.js');
const Converter = require('../utils/Converter.js');
const Generator = require('../utils/Generator.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');
const moment = require("moment/moment");

const globalPrefix = '/models/device/post.js';

module.exports = function (context, device) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId
    });

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            const generator = new Generator(context);
            const converter = new Converter(context);
            logger.debug('device: %j', device);
            if (typeof device === 'undefined') {
                let error = errorParsing({status_code: 400, status_message: 'Missing parameter'});
                logger.error('error: %j', error);
                reject(error);
            } else {
                let timestamp = parseInt(moment().format('x'));
                converter.json2db(device, converter.deviceSchema)
                    .then(query => {
                        logger.debug('query: %j', query);
                        query.device_id = generator.idgen();
                        query.creation_date = timestamp;
                        query.last_connexion_date = timestamp;
                        return mongoInsert(context, 'device', query);
                    })
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            return converter.db2json(datas[0], converter.deviceSchema);
                        } else {
                            let error = errorParsing(context, 'No datas inserted');
                            logger.error('error: %j', error);
                            return (error);
                        }
                    })
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                reject(datas);
                            } else {
                                resolve(datas);
                            }
                        } else {
                            let error = errorParsing(context, 'No datas converted');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    });
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};