const Moment = require('moment');
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const Generator = require('../generator.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

class Converter {
    constructor(context) {
        this.context = context;
    }

    json2db(data) {
        const log4n = new Log4n(this.context, '/models/api/device/converter/json2db');
        // log4n.object(data, 'data');

        return new Promise((resolve, reject) => {
            try {
                let result = {};

                //ajout des informations générées par le serveur
                const generator = new Generator(this.context);
                data.device_id = generator.idgen();
                if (typeof data.key === 'undefined') {
                    data.key = generator.keygen();
                }
                if (typeof data.creation_date === 'undefined') {
                    data.creation_date = parseInt(Moment().format('x'));
                }
                if (typeof data.last_connexion_date === 'undefined') {
                    data.last_connexion_date = parseInt(Moment().format('x'));
                }

                let schemaPath = path.join(__dirname, 'devicejs.json');
                // log4n.object(schemaPath, 'schemaPath');
                let jsonSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                // log4n.object(jsonSchema, 'jsonSchema');
                let ajv = new Ajv();
                require('ajv-async')(ajv);
                let validate = ajv.compile(jsonSchema);

                log4n.debug('schema validation');
                log4n.object(data, 'data');
                validate(data)
                    .then(valid => {
                        // log4n.object(valid, 'valid');
                        if (typeof valid.device_id !== 'undefined') result.device_id = valid.device_id;
                        if (typeof valid.key !== 'undefined') result.key = valid.key;
                        if (typeof valid.user_id !== 'undefined') result.user_id = valid.user_id;
                        if (typeof valid.manufacturer !== 'undefined') result.manufacturer = valid.manufacturer;
                        if (typeof valid.model !== 'undefined') result.model = valid.model;
                        if (typeof valid.serial !== 'undefined') result.serial = valid.serial;
                        if (typeof valid.secret !== 'undefined') result.secret = valid.secret;
                        if (typeof valid.name !== 'undefined') result.name = valid.name;
                        if (typeof valid.class !== 'undefined') result.class = valid.class;
                        if (typeof valid.software_version !== 'undefined') result.software_version = valid.software_version;
                        if (typeof valid.local_ip !== 'undefined') result.local_ip = valid.local_ip;
                        if (typeof valid.creation_date !== 'undefined') result.creation_date = valid.creation_date;
                        if (typeof valid.last_connexion_date !== 'undefined') result.last_connexion_date = valid.last_connexion_date;
                        if (typeof valid.capabilities !== 'undefined') {
                            result.capabilities = [];
                            for (let i in valid.capabilities) {
                                let datas = valid.capabilities[i];
                                // log4n.object(datas, 'datas');
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
                                        capability.subscribe = "switch/" + valid.device_id;
                                        break;
                                    case 'SLAVE':
                                        capability.publish = "";
                                        capability.subscribe = "slave/" + valid.device_id;
                                        break;
                                    default:
                                        capability.publish = "";
                                        capability.subscribe = "";
                                        break;

                                }
                                result.capabilities.push(capability);
                            }
                        }
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

    db2json(data) {
        const log4n = new Log4n(this.context, '/models/api/device/converter/db2json');
        // log4n.object(data, 'data');

        return new Promise((resolve, reject) => {
            try {
                let result = {};

                let schemaPath = path.join(__dirname, 'devicedb.json');
                // log4n.object(schemaPath, 'schemaPath');
                let dbSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

                // log4n.object(dbSchema, 'dbSchema');
                let ajv = new Ajv();
                require('ajv-async')(ajv);
                let validate = ajv.compile(dbSchema);

                log4n.debug('schema validation');
                // log4n.object(data, 'data');
                validate(data)
                    .then(valid => {
                        // log4n.object(valid, 'valid');
                        if (typeof valid.device_id !== 'undefined') result.device_id = valid.device_id;
                        if (typeof valid.key !== 'undefined') result.key = valid.key;
                        if (typeof valid.user_id !== 'undefined') result.user_id = valid.user_id;
                        if (typeof valid.manufacturer !== 'undefined') result.manufacturer = valid.manufacturer;
                        if (typeof valid.model !== 'undefined') result.model = valid.model;
                        if (typeof valid.serial !== 'undefined') result.serial = valid.serial;
                        if (typeof valid.secret !== 'undefined') result.secret = valid.secret;
                        if (typeof valid.name !== 'undefined') result.name = valid.name;
                        if (typeof valid.creation_date !== 'undefined') result.creation_date = valid.creation_date;
                        if (typeof valid.class !== 'undefined') result.class = valid.class;
                        if (typeof valid.software_version !== 'undefined') result.software_version = valid.software_version;
                        if (typeof valid.local_ip !== 'undefined') result.local_ip = valid.local_ip;
                        if (typeof valid.creation_date !== 'undefined') result.creation_date = valid.creation_date;
                        if (typeof valid.last_connexion_date !== 'undefined') result.last_connexion_date = valid.last_connexion_date;
                        if (typeof valid.capabilities !== 'undefined') result.capabilities = valid.capabilities;

                        log4n.debug('done - ok');
                        // log4n.object(result,'result');
                        resolve(result);
                    })
                    .catch(error => {
                        reject(errorparsing(this.context, {
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