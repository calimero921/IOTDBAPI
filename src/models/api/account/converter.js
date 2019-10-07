const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

class Converter {
    constructor(context) {
        this.context = context;
    }

    json2db(data) {
        const log4n = new Log4n(this.context, '/models/api/account/converter/json2db');
        // log4n.object(data,'data');

        return new Promise((resolve, reject) => {
            try {
                let result = {};
                let ajv = new Ajv();
                require('ajv-async')(ajv);

                let schemaPath = path.join(__dirname, 'accountjs.json');
                // log4n.object(schemaPath, 'schemaPath');
                let jsonSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                // log4n.object(jsonSchema, 'jsonSchema');
                let validate = ajv.compile(jsonSchema);

                log4n.debug('schema validation');
                validate(data)
                    .then(valid => {
                        // log4n.object(valid, 'valid');
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

                        // log4n.object(result, 'result');
                        log4n.debug('done - ok');
                        resolve(result);
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                        log4n.debug('done - promise catch');
                    });
            } catch (error) {
                log4n.object(error, 'error');
                reject(errorparsing(this.context, error));
                log4n.debug('done - global catch');
            }
        });
    };

    db2json(data) {
        const log4n = new Log4n(this.context, '/models/api/account/converter/db2json');
        // log4n.object(data, 'data');

        return new Promise((resolve, reject) => {
            try {
                let result = {};
                let ajv = new Ajv();
                require('ajv-async')(ajv);

                let schemaPath = path.join(__dirname, 'accountdb.json');
                // log4n.object(schemaPath, 'schemaPath');
                let dbSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                // log4n.object(dbSchema, 'dbSchema');
                let validate = ajv.compile(dbSchema);

                log4n.debug('schema validation');
                validate(data)
                    .then(valid => {
                        // log4n.object(valid, 'valid');
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

                        // log4n.object(result, 'result');
                        resolve(result);
                        log4n.debug('done - ok');
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                        log4n.debug('done - promise catch');
                    });
            } catch (error) {
                log4n.object(error, 'error');
                reject(errorparsing(this.context, error));
                log4n.debug('done - global catch');
            }
        });
    };
}

module.exports = Converter;