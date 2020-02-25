const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');

const serverLogger = require('../../utils/ServerLogger.js');

const globalPrefix = '/models/utils/validator';

class Validator {
    constructor(context, jsonSchema, mongoSchema) {
        this.context = context;
        let logger = serverLogger.child({
            source: globalPrefix + ':constructor:',
            httpRequestId: context.httpRequestId
        });
        logger.info('creating validator');
        this.jsonSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', jsonSchema)));
        logger.debug('jsonSchema: %j', jsonSchema);
        this.mongoSchema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', mongoSchema)));
        logger.debug('mongoSchema: %j', mongoSchema);

        let ajvOptions = {
            useDefaults: true,
            removeAdditional: true
        };
        this.ajv = new Ajv(ajvOptions);
    }

    getJsonSchema() {
        let logger = serverLogger.child({
            source: globalPrefix + ':getJsonSchema:',
            httpRequestId: this.context.httpRequestId
        });

        logger.info('getting JSON schema');
        let schema = this.jsonSchema;
        logger.debug('schema: %s', schema);
        return schema;
    }

    getMongoSchema() {
        let logger = serverLogger.child({
            source: globalPrefix + ':getMongoSchema:',
            httpRequestId: this.context.httpRequestId
        });

        logger.info('getting Mongo schema');
        let schema = this.mongoSchema;
        logger.debug('schema: %s', schema);
        return schema;
    }

    jsonValidator(jsonObject) {
        let logger = serverLogger.child({
            source: globalPrefix + ':jsonValidator:',
            httpRequestId: this.context.httpRequestId
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
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    })
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(exception);
            }
        })
    }

    mongoValidator(mongoObject) {
        let logger = serverLogger.child({
            source: globalPrefix + ':mongoValidator:',
            httpRequestId: this.context.httpRequestId
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
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    })
            } catch (exception) {
                logger.error('exception: %s', exception.stack);
                reject(exception);
            }
        })
    }
}

module.exports = Validator;