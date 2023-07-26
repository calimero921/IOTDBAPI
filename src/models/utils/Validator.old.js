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
const Ajv = require('ajv');

const {serverLogger} = require('server-logger');
const errorParsing=require('../../utils/errorParsing.js')

const globalPrefix = '/models/utils/validator';

class ValidatorOld {
    constructor(context, jsonSchema, mongoSchema) {
        this.context = context;
        let logger = logger.child({
            source: globalPrefix + ':constructor:',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });
        this.jsonSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', jsonSchema)));
        logger.debug('jsonSchema: %s', jsonSchema);
        this.mongoSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', mongoSchema)));
        logger.debug('mongoSchema: %s', mongoSchema);

        let ajvOptions = {
            useDefaults: true,
            removeAdditional: true
        };
        this.ajv = new Ajv(ajvOptions);
    }

    getJsonSchema() {
        let logger = logger.child({
            source: globalPrefix + ':getJsonSchema:',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        let schema = this.jsonSchema;
        logger.debug('schema: %j', schema);
        return schema;
    }

    getMongoSchema() {
        let logger = logger.child({
            source: globalPrefix + ':getMongoSchema:',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        let schema = this.mongoSchema;
        logger.debug('schema: %j', schema);
        return schema;
    }

    jsonValidator(jsonObject) {
        let logger = logger.child({
            source: globalPrefix + ':jsonValidator:',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('jsonObject: %j', jsonObject);

                let schema = this.getJsonSchema();
                let validator = this.ajv.compile(schema);
                validator(jsonObject)
                    .then(object => {
                        logger.debug('object: %j', object);
                        resolve(object);
                    })
                    .catch(validationError => {
                        let error = errorParsing(this.context, validationError);
                        logger.error('error: %j', error);
                        reject(error);
                    })
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(errorParsing(this.context,exception));
            }
        })
    }

    mongoValidator(mongoObject) {
        let logger = logger.child({
            source: globalPrefix + ':mongoValidator:',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('mongoObject: %j', mongoObject);

                let schema = this.getMongoSchema();
                let validator = this.ajv.compile(schema);
                validator(mongoObject)
                    .then(object => {
                        logger.debug('object: %j', object);
                        resolve(object);
                    })
                    .catch(validationError => {
                        let error = errorParsing(this.context, validationError);
                        logger.error('error: %j', error);
                        reject(error);
                    })
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(errorParsing(this.context,exception));
            }
        })
    }
}

module.exports = ValidatorOld;