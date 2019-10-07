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
        const log4n = new Log4n(this.context, '/models/api/event/converter/json2db');
        // log4n.object(data, 'data');

        return new Promise((resolve, reject) => {
            try {
                let result = {};
                let ajv = new Ajv();
                require('ajv-async')(ajv);

                let schemaPath = path.join(__dirname, 'eventjs.json');
                // log4n.object(schemaPath, 'schemaPath');
                let jsonSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                // log4n.object(jsonSchema, 'jsonSchema');
                let validate = ajv.compile(jsonSchema);

                log4n.debug('schema validation');
                validate(data)
                    .then(valid => {
                        // log4n.object(valid, 'valid');
                        if (typeof valid.device_id !== 'undefined') result.device_id = valid.device_id;
                        if (typeof valid.capabilities !== 'undefined') {
                            result.capabilities = [];
                            for (let i in valid.capabilities) {
                                let datas = valid.capabilities[i];
                                // log4n.object(datas, 'datas');
                                let capability = {
                                    "name": datas.name,
                                    "value": datas.value
                                };
                                result.capabilities.push(capability);
                            }
                        }
                        // log4n.object(result, 'result');
                        resolve(result);
                        log4n.debug('done - ok');
                    })
                    .catch(error => {
                        log4n.object(error, 'error');
                        reject(errorparsing(this.context,{
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
        const log4n = new Log4n(this.context, '/models/api/event/converter/db2json');
        // log4n.object(data, 'data');

        return new Promise((resolve, reject) => {
            try {
                let result = {};
                let ajv = new Ajv();
                require('ajv-async')(ajv);

                let schemaPath = path.join(__dirname, 'eventdb.json');
                // log4n.object(schemaPath, 'schemaPath');
                let dbSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                // log4n.object(dbSchema, 'dbSchema');
                let validate = ajv.compile(dbSchema);

                log4n.debug('schema validation');
                validate(data)
                    .then(valid => {
                        // log4n.object(valid, 'valid');
                        if (typeof valid.device_id !== 'undefined') result.device_id = valid.device_id;
                        if (typeof valid.store_date !== 'undefined') result.store_date = valid.store_date;
                        if (typeof valid.capabilities !== 'undefined') result.capabilities = valid.capabilities;

                        log4n.debug('done - ok');
                        // log4n.object(result,'result');
                        resolve(result);
                    })
                    .catch(error => {
                        reject(errorparsing(this.context,{
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                    });
            } catch (error) {
                log4n.object(error, 'error');
                reject(errorparsing(this.context, error));
            }
        });
    };
}

module.exports = Converter;