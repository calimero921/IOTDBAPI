/**
 * Orange DIOD IAM API
 *
 * Copyright (C) 2019 - 2021 Orange
 *
 * This software is confidential and proprietary information of Orange.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * If you are Orange employee you shall use this software in accordance with
 * the Orange Source Charter (http://opensource.itn.ftgroup/index.php/Orange_Source).
 *
 * @author SOFT Pessac
 */

'use strict';

const path = require('path');
const fs = require('fs');

const Validator = require('./Validator.js');
const Translate = require('./Translator.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');

const accountSchema = 'Account';
const deviceSchema = 'Device';
const eventSchema = 'Event';
const globalPrefix = '/models/utils/Converter.js';

class Converter {
    constructor(context) {
        this.context = context;
        const logger = serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        logger.debug('Creating Converter instance');

        this.accountSchema = accountSchema;
        this.deviceSchema = deviceSchema;
        this.eventSchema = eventSchema;

        logger.debug('Converter instance created');
    }

    db2json(dbRecord, schemaName, simple) {
        const logger = serverLogger.child({
            source: globalPrefix + ':db2json',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('dbRecord: %j', dbRecord);
                logger.debug('schemaName: %j', schemaName);
                if (!simple) {
                    simple = false
                }
                logger.debug('simple: %s', simple);

                const validator = new Validator(this.context);

                if (dbRecord) {
                    if (Object.keys(dbRecord).length > 0) {
                        validator.validate(dbRecord, schemaName, validator.dbExtension, simple)
                            .then(result => {
                                logger.debug('db validation: %j', result);
                                return db2jsonConversion(this.context, dbRecord, schemaName);
                            })
                            .then(result => {
                                logger.debug('db convertion: %j', result);
                                resolve(result);
                            })
                            .catch(error => {
                                logger.error('error: %j', error);
                                reject(errorParsing(this.context, error));
                            });
                    } else {
                        logger.debug('empty json to convert');
                        resolve({});
                    }
                } else {
                    logger.debug('no json to convert');
                    resolve();
                }
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(errorParsing(context, exception));
            }
        })
    }

    json2db(jsonObject, schemaName, simple) {
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('jsonObject: %j', jsonObject);
                logger.debug('schemaName: %j', schemaName);
                if (!simple) {
                    simple = false
                }
                logger.debug('simple: %s', simple);

                const validator = new Validator(this.context);

                if (jsonObject) {
                    if (Object.keys(jsonObject).length > 0) {
                        validator.validate(jsonObject, schemaName, validator.jsonExtension, simple)
                            .then(result => {
                                logger.debug('db validation: %j', result);
                                return json2dbConversion(this.context, jsonObject, schemaName);
                            })
                            .then(result => {
                                logger.debug('db convertion: %j', result);
                                resolve(result);
                            })
                            .catch(error => {
                                logger.error('error: %j', error);
                                reject(error);
                            });
                    } else {
                        logger.debug('empty json to convert');
                        resolve({});
                    }
                } else {
                    logger.debug('no json to convert');
                    resolve();
                }
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(errorParsing(context, exception));
            }
        })
    }
}

function getConversion(context, conversionName) {
    const logger = serverLogger.child({
        source: globalPrefix + ':getConversion',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.debug('conversionName: %s', conversionName);
    let conversionNameValidated = false;
    switch (conversionName) {
        case accountSchema:
        case deviceSchema:
        case eventSchema:
            conversionNameValidated = true;
            break;
        default:
            break;
    }
    logger.debug('conversionNameValidated: %s', conversionNameValidated);

    if (conversionNameValidated) {
        const conversionFileName = `${conversionName}Conversion.json`;
        logger.debug('conversionFileName: %s', conversionFileName);
        const conversionFilePath = path.join(process.cwd(), 'src', 'models', 'utils', 'conversions', conversionFileName);
        logger.debug('conversionFilePath: %s', conversionFilePath);

        if (fs.existsSync(conversionFilePath)) {
            const conversion = JSON.parse(fs.readFileSync(conversionFilePath));
            logger.debug('conversion: %j', conversion);
            return conversion;
        } else {
            return errorParsing(context, {status_code: 400, status_message: 'missing conversion file'});
        }
    } else {
        return errorParsing(context, {status_code: 400, status_message: 'bad conversion name or type'});
    }
}

function db2jsonConversion(context, dbObject, schemaName) {
    const logger = serverLogger.child({
        source: globalPrefix + ':db2jsonConversion',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            let result = {};
            if (!dbObject || dbObject === {}) {
                const error = errorParsing(context, 'dbObject is empty');
                logger.error('error: %j', error);
                reject(error);
            } else {
                Object.keys(dbObject).forEach(attribute => {
                    if (dbObject.hasOwnProperty(attribute)) {
                        if ((typeof dbObject[attribute] === 'string') && (dbObject[attribute].length === 0)) {
                            delete dbObject[attribute];
                        }
                    }
                });

                const conversions = getConversion(context, schemaName);
                logger.debug('conversions: %j', conversions);

                const translate = new Translate(context)

                for (const convert of conversions.fields) {
                    if (convert.logDisplay) {
                        logger.debug('convert: %j / dbObject.%s = %s', convert, convert.dbName, dbObject[convert.dbName]);
                    }
                    if (convert.db2json) {
                        if (dbObject.hasOwnProperty(convert.dbName)) {
                            switch (convert.type) {
                                case'array':
                                    result[convert.jsonName] = translate.toArray(dbObject[convert.dbName])
                                    break;
                                case'boolean':
                                    result[convert.jsonName] = translate.toBoolean(dbObject[convert.dbName])
                                    break;
                                case'integer':
                                    result[convert.jsonName] = translate.toInteger(dbObject[convert.dbName])
                                    break;
                                case 'dbCN':
                                    result[convert.jsonName] = translate.toLdapCN(dbObject[convert.dbName]);
                                    break;
                                case 'date':
                                    result[convert.jsonName] = translate.toDate(dbObject[convert.dbName]);
                                    break;
                                case 'password':
                                    result[convert.jsonName] = translate.toPassword(dbObject[convert.dbName]);
                                    break;
                                case 'string':
                                default:
                                    result[convert.jsonName] = dbObject[convert.dbName];
                                    break;
                            }
                            logger.debug('result[%s] = %s', convert.jsonName, result[convert.jsonName]);
                        }
                    }
                }

                logger.debug('converted result: %j', result);
                resolve(result);
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(exception);
        }
    })
}

function json2dbConversion(context, jsonObject, schemaName) {
    const logger = serverLogger.child({
        source: globalPrefix + ':json2dbConversion',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('context: %j', context);
            logger.debug('jsonObject: %j', jsonObject);
            logger.debug('schemaName: %s', schemaName);
            if (jsonObject) {
                let result = {};
                Object.keys(jsonObject).forEach(attribute => {
                    if ((typeof jsonObject[attribute] === 'string') && (jsonObject[attribute].length === 0)) {
                        delete jsonObject[attribute];
                    }
                });

                const conversions = getConversion(context, schemaName);
                logger.debug('conversions: %j', conversions);

                const translate = new Translate(context)

                for (const convert of conversions.fields) {
                    if (convert.logDisplay) {
                        logger.debug('convert: %j / jsonObject.%s = %s', convert, convert.jsonName, jsonObject[convert.jsonName]);
                    }
                    if (convert.json2db) {
                        if (jsonObject.hasOwnProperty(convert.jsonName)) {
                            switch (convert.type) {
                                case 'array':
                                    result[convert.dbName] = translate.fromArray(jsonObject[convert.jsonName])
                                    break;
                                case 'boolean':
                                    result[convert.dbName] = translate.fromBoolean(jsonObject[convert.jsonName])
                                    break;
                                case 'integer':
                                    result[convert.dbName] = translate.fromInteger(jsonObject[convert.jsonName])
                                    break;
                                case 'dbCN':
                                    result[convert.dbName] = translate.fromLdapCN(jsonObject[convert.jsonName])
                                    break;
                                case 'date':
                                    result[convert.dbName] = translate.fromDate(jsonObject[convert.jsonName])
                                    break;
                                case 'password':
                                    result[convert.dbName] = translate.fromPassword(jsonObject[convert.jsonName])
                                    break;
                                case 'string':
                                default:
                                    result[convert.dbName] = jsonObject[convert.jsonName];
                                    break;
                            }
                        }
                    }
                }

                logger.debug('converted result: %j', result);
                resolve(result);
            } else {
                const error = errorParsing(context, 'wrong parameters');
                logger.error('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(exception);
        }
    })
}

module.exports = Converter;
