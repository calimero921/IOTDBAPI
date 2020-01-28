const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const serverLogger = require('../../../utils/ServerLogger.js');
const errorparsing = require('../../../utils/errorParsing.js');

const globalPrefix = '/models/account/utils/converter';

class Converter {
    constructor(context) {
        this.context = context;
    }

    json2db(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId
        });

        logger.debug('data: %j', data);

        return new Promise((resolve, reject) => {
            try {
                let result = {};
                let ajv = new Ajv();
                require('ajv-async')(ajv);

                let schemaPath = path.join(__dirname, 'accountjs.json');
                logger.debug('schemaPath: %s', schemaPath);
                let jsonSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                logger.debug('jsonSchema: %j', jsonSchema);
                let validate = ajv.compile(jsonSchema);

                logger.debug('schema validation');
                validate(data)
                    .then(valid => {
                        logger.debug('valid: %j', valid);
                        if (typeof data !== 'undefined') {
                            if (typeof valid.id !== 'undefined') result.id = valid.id;
                            result.firstname = valid.firstname;
                            result.lastname = valid.lastname;
                            result.email = valid.email;
                            if (typeof valid.session_id !== 'undefined') result.session_id = valid.session_id;
                            if (typeof valid.admin !== 'undefined') result.admin = valid.admin;
                            if (typeof valid.active !== 'undefined') result.active = valid.active;
                            if (typeof valid.creation_date !== 'undefined') result.creation_date = valid.creation_date;
                            if (typeof valid.current_connexion_date !== 'undefined') result.current_connexion_date = valid.current_connexion_date;
                            if (typeof valid.last_connexion_date !== 'undefined') result.last_connexion_date = valid.last_connexion_date;
                            if (typeof valid.token !== 'undefined') result.token = valid.token;
                        }

                        logger.debug('result: %j', result);
                        resolve(result);
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(errorparsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                    });
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorparsing(this.context, error));
            }
        });
    };

    db2json(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':db2json',
            httpRequestId: this.context.httpRequestId
        });

        logger.debug('data: %j', data);

        return new Promise((resolve, reject) => {
            try {
                let result = {};
                let ajv = new Ajv();
                require('ajv-async')(ajv);

                let schemaPath = path.join(__dirname, 'accountdb.json');
                logger.debug('schemaPath: %s', schemaPath);
                let dbSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                logger.debug('dbSchema: %j', dbSchema);
                let validate = ajv.compile(dbSchema);

                logger.debug('schema validation');
                validate(data)
                    .then(valid => {
                        // logger.debug(valid, 'valid');
                        result.id = valid.id;
                        result.firstname = valid.firstname;
                        result.lastname = valid.lastname;
                        result.email = valid.email;
                        result.session_id = valid.session_id;
                        result.admin = valid.admin;
                        result.active = valid.active;
                        result.creation_date = valid.creation_date;
                        result.current_connexion_date = valid.current_connexion_date;
                        result.last_connexion_date = valid.last_connexion_date;
                        result.token = valid.token;

                        logger.debug('result: %j', result);
                        resolve(result);
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(errorparsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                    });
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorparsing(this.context, error));
            }
        });
    };
}

module.exports = Converter;