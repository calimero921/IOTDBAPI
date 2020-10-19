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

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const Moment = require('moment');
const Validator = require('./Validator.js');

const serverLogger = require('../../../utils/ServerLogger.js');
const errorParsing = require('../../../utils/errorParsing.js');

const globalPrefix = '/models/device/converter';

class Converter {
    constructor(context) {
        this.context = context;
        const logger = serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: this.context.httpRequestId
        });

        logger.debug('Converter created');
        this.validator = new Validator(context);
    }

    json2db(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', data);
                let result = {};

                data.store_date = parseInt(Moment().format('x'));
                if (typeof data.event_date === 'undefined') {
                    data.event_date = data.store_date;
                }

                logger.debug('schema validation');
                logger.debug('data: %j', data);
                this.validator.jsonValidator(data)
                    .then(valid => {
                        // logger.debug(valid, 'valid');
                        if (valid.device_id) result.device_id = valid.device_id;
                        if (valid.event_date) result.event_date = valid.event_date;
                        if (valid.store_date) result.store_date = valid.store_date;
                        if (valid.capabilities) {
                            result.capabilities = [];
                            for (let i in valid.capabilities) {
                                let datas = valid.capabilities[i];
                                logger.debug('datas: %j', datas);
                                let capability = {
                                    "name": datas.name,
                                    "value": datas.value
                                };
                                result.capabilities.push(capability);
                            }
                        }
                        logger.debug('result: %j', result);
                        resolve(result);
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(errorParsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                    });
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorParsing(this.context, exception));
            }
        });
    }

    db2json(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':db2json',
            httpRequestId: this.context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', data);
                let result = {};

                logger.debug('schema validation');
                this.validator.mongoValidator(data)
                    .then(valid => {
                        logger.debug('valid: %j', valid);
                        if (valid.device_id) result.device_id = valid.device_id;
                        if (valid.event_date) result.event_date = valid.event_date;
                        if (valid.store_date) result.store_date = valid.store_date;
                        if (valid.capabilities) result.capabilities = valid.capabilities;

                        logger.debug('result: %j', result);
                        resolve(result);
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(errorParsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                    });
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorParsing(this.context, exception));
            }
        });
    }
}

module.exports = Converter;