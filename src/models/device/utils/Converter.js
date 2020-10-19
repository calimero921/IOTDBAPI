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

const Moment = require('moment');

const Generator = require('../../utils/Generator.js');
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

    json2db(jsonObject) {
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('jsonObject: %j', jsonObject);
                let result = {};

                //ajout des informations générées par le serveur
                const generator = new Generator(this.context);
                jsonObject.device_id = generator.idgen();
                if (!jsonObject.key) jsonObject.key = generator.keygen();
                if (!jsonObject.creation_date) jsonObject.creation_date = parseInt(Moment().format('x'));
                if (!jsonObject.last_connexion_date) jsonObject.last_connexion_date = parseInt(Moment().format('x'));
                logger.debug('jsonObject: %j', jsonObject);

                logger.debug('schema validation');
                this.validator.jsonValidator(jsonObject)
                    .then(validated => {
                        logger.debug('validated: %j', validated);
                        if (validated.device_id) result.device_id = validated.device_id;
                        if (validated.key) result.key = validated.key;
                        if (validated.user_id) result.user_id = validated.user_id;
                        if (validated.manufacturer) result.manufacturer = validated.manufacturer;
                        if (validated.model) result.model = validated.model;
                        if (validated.serial) result.serial = validated.serial;
                        if (validated.secret) result.secret = validated.secret;
                        if (validated.name) result.name = validated.name;
                        if (validated.class) result.class = validated.class;
                        if (validated.software_version) result.software_version = validated.software_version;
                        if (validated.local_ip) result.local_ip = validated.local_ip;
                        if (validated.creation_date) result.creation_date = validated.creation_date;
                        if (validated.last_connexion_date) result.last_connexion_date = validated.last_connexion_date;
                        if (validated.capabilities) {
                            result.capabilities = [];
                            for (let i in validated.capabilities) {
                                let datas = validated.capabilities[i];
                                logger.debug('datas: %j', datas);
                                let capability = {
                                    "name": datas.name,
                                    "type": datas.type,
                                    "last_value": datas.last_value
                                };
                                switch (datas.type.toUpperCase()) {
                                    case 'SENSOR':
                                        capability.publish = "sensor";
                                        capability.subscribe = "";
                                        break;
                                    case 'SWITCH':
                                        capability.publish = "switch";
                                        capability.subscribe = "switch/" + validated.device_id;
                                        break;
                                    case 'SLAVE':
                                        capability.publish = "";
                                        capability.subscribe = "slave/" + validated.device_id;
                                        break;
                                    default:
                                        capability.publish = "";
                                        capability.subscribe = "";
                                        break;

                                }
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
                logger.error('exception: %s', exception.stack);
                reject(errorParsing(this.context, exception));
            }
        });
    }

    db2json(mongoObject) {
        const logger = serverLogger.child({
            source: globalPrefix + ':db2json',
            httpRequestId: this.context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', mongoObject);
                let result = {};
                logger.debug('schema validation');
                this.validator.mongoValidator(mongoObject)
                    .then(validated => {
                        logger.debug('validated: %j', validated);
                        if (validated.device_id) result.device_id = validated.device_id;
                        if (validated.key) result.key = validated.key;
                        if (validated.user_id) result.user_id = validated.user_id;
                        if (validated.manufacturer) result.manufacturer = validated.manufacturer;
                        if (validated.model) result.model = validated.model;
                        if (validated.serial) result.serial = validated.serial;
                        if (validated.secret) result.secret = validated.secret;
                        if (validated.name) result.name = validated.name;
                        if (validated.creation_date) result.creation_date = validated.creation_date;
                        if (validated.class) result.class = validated.class;
                        if (validated.software_version) result.software_version = validated.software_version;
                        if (validated.local_ip) result.local_ip = validated.local_ip;
                        if (validated.creation_date) result.creation_date = validated.creation_date;
                        if (validated.last_connexion_date) result.last_connexion_date = validated.last_connexion_date;
                        if (validated.capabilities) result.capabilities = validated.capabilities;

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
                logger.error('exception: %s', exception.stack);
                reject(errorParsing(this.context, exception));
            }
        });
    }
}

module.exports = Converter;