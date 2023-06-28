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

const path = require('path');
const fs = require('fs');
const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');

const serverLogger = require('../../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

const globalPrefix = '/models/utils/Validator.js';

class Validator {
    constructor(context) {
        this.context = context;
        const logger = serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        logger.debug('Creating Validator instance');

        this.accountSchema = 'Account';
        this.deviceSchema = 'Device';
        this.eventSchema = 'Event';

        this.dbExtension = 'DB';
        this.jsonExtension = 'Json';

        const ajvOptions = {
            strict: false,
            useDefaults: true,
            removeAdditional: true
        };
        this.ajv = new Ajv(ajvOptions);
        addFormats(this.ajv);
        logger.debug('Validator instance created');
    }

    getSchema(schemaName, schemaType, simple) {
        const logger = serverLogger.child({
            source: globalPrefix + ':getSchema',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('schemaName: %s', schemaName);
        let schemaNameValidated = false;
        switch (schemaName) {
            case this.accountSchema:
            case this.deviceSchema:
            case this.eventSchema:
                schemaNameValidated = true;
                break;
            default:
                break;
        }
        logger.debug('schemaNameValidated: %s', schemaNameValidated);

        logger.debug('schemaType: %s', schemaType);
        let schemaTypeValidated = false;
        switch (schemaType) {
            case this.jsonExtension:
            case this.dbExtension:
                schemaTypeValidated = true;
                break;
            default:
                break;
        }
        logger.debug('schemaTypeValidated: %s', schemaTypeValidated);

        if (schemaNameValidated && schemaTypeValidated) {
            let schemaFileName = `${schemaName}${schemaType}Schema.json`;
            logger.debug('schemaFileName: %s', schemaFileName);
            const schemaFilePath = path.join(process.cwd(), 'src', 'models', 'utils', 'schemas', schemaFileName);
            logger.debug('schemaFilePath: %s', schemaFilePath);

            if (fs.existsSync(schemaFilePath)) {
                const schema = JSON.parse(fs.readFileSync(schemaFilePath));
                logger.debug('schema: %j', schema);

                if (!simple) {
                    let schemaRequiredFileName = `${schemaName}${schemaType}RequiredSchema.json`;
                    logger.debug('schemaRequiredFileName: %s', schemaRequiredFileName);
                    const schemaRequiredFilePath = path.join(process.cwd(), 'src', 'models', 'utils', 'schemas', schemaRequiredFileName);
                    logger.debug('schemaRequiredFilePath: %s', schemaRequiredFilePath);
                    if (fs.existsSync(schemaRequiredFilePath)) {
                        const requiredSchema = JSON.parse(fs.readFileSync(schemaRequiredFilePath));
                        logger.debug('requiredSchema: %j', requiredSchema);
                        schema.required = requiredSchema.required;
                        logger.debug('schema: %j', schema);
                        return schema;
                    } else {
                        return errorParsing(this.context, {status_code: 400, status_message: 'missing schema file'});
                    }
                } else {
                    return schema;
                }
            } else {
                return errorParsing(this.context, {status_code: 400, status_message: 'missing schema file'});
            }
        } else {
            return errorParsing(this.context, {status_code: 400, status_message: 'bad schema name or type'});
        }
    }

    validate(object, schemaName, schemaType, simple) {
        const logger = serverLogger.child({
            source: globalPrefix + ':validate',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('object: %j', object);
                if (!simple) {
                    simple = false
                }
                logger.debug('simple: %s', simple);

                const schema = this.getSchema(schemaName, schemaType, simple);
                logger.debug('schema: %j', schema);

                if(schema.status_code){
                    reject(schema);
                } else {
                    const validator = this.ajv.compile(schema);
                    validator(object)
                        .then(result => {
                            logger.debug('result: %j', result);
                            resolve(result);
                        })
                        .catch(error => {
                            logger.error('error: %j', error);
                            reject(errorParsing(this.context, {
                                status_code: 400,
                                status_message: 'validation failed'
                            }));
                        });
                }
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(exception);
            }
        })
    }
}

module.exports = Validator;
