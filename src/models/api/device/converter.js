const Moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const Ajv = require('ajv');

function Converter() {
}

Converter.prototype.json2db = function (data) {
    const log4n = new Log4n('/models/api/sessions/converter/json2db');
    // log4n.object(data, 'data');

    return new Promise(function (resolve, reject) {
        try {
            let result = {};
            let ajv = new Ajv();
            require('ajv-async')(ajv);

            let jsonSchema = {
                "$async": true,
                "type": "object",
                "properties": {
                    "manufacturer": {"type": "string"},
                    "serial_number": {"type": "string"},
                    "name": {"type": "string"},
                    "creation_date": {"type": "integer"},
                    "class": {"type": "string"},
                    "software_version": {"type": "string"},
                    "capabilities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "type": {"enum": ["sensor", "switch", 'slave']},
                                "publish": {"type": "string"},
                                "subscribe": {"type": "string"},
                                "last_value": {"type": "string"}
                            },
                            "required": ["name", "type"]
                        }
                    },
                },
                "required": ["manufacturer", "serial_number", "name", "class", "software_version", "capabilities"]
            };

            // log4n.object(jsonSchema, 'jsonSchema');
            let validate = ajv.compile(jsonSchema);

            log4n.debug('validation schema');
            validate(data)
                .then(valid => {
                    // log4n.object(valid, 'valid');
                    if (typeof valid.manufacturer !== 'undefined') result.manufacturer = valid.manufacturer;
                    if (typeof valid.serial_number !== 'undefined') result.serial_number = valid.serial_number;
                    if (typeof valid.name !== 'undefined') result.name = valid.name;
                    if (typeof valid.class !== 'undefined') result.class = valid.class;
                    if (typeof valid.software_version !== 'undefined') result.software_version = valid.software_version;
                    if (typeof valid.capabilities !== 'undefined') {
                        result.capabilities = [];
                        for (let i in valid.capabilities) {
                            let datas = valid.capabilities[i];
                            // log4n.object(datas, 'datas');
                            let capability = {"name": datas.name, "type": datas.type, "last_value": datas.last_value};
                            switch (datas.type.toUpperCase()) {
                                case 'SENSOR':
                                    capability.publish = "sensor";
                                    capability.subscribe = "";
                                    break;
                                case 'SWITCH':
                                    capability.publish = "switch";
                                    capability.subscribe = "switch/" + valid.id;
                                    break;
                                case 'SLAVE':
                                    capability.publish = "";
                                    capability.subscribe = "slave/" + valid.id;
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
                    reject(errorparsing({
                        error_code: 500,
                        error_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                    }));
                    log4n.debug('done - promise catch');
                });
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorparsing(error));
            log4n.debug('done - global catch');
        }
    });
};

Converter.prototype.db2json = function (data) {
    const log4n = new Log4n('/models/api/device/converter/db2json');
    // log4n.object(data, 'data');

    return new Promise(function (resolve, reject) {
        try {
            let result = {};
            let ajv = new Ajv();
            require('ajv-async')(ajv);

            let dbSchema = {
                "$async": true,
                "type": "object",
                "properties": {
                    "id": {"type": "string", "format": "uuid"},
                    "manufacturer": {"type": "string"},
                    "serial_number": {"type": "string"},
                    "name": {"type": "string"},
                    "creation_date": {"type": "integer"},
                    "class": {"type": "string"},
                    "software_version": {"type": "string"},
                    "capabilities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "type": {"enum": ["sensor", "switch", 'slave']},
                                "publish": {"type": "string"},
                                "subscribe": {"type": "string"},
                                "last_value": {"type": "string"}
                            },
                            "required": ["name", "type", "publish", "subscribe", "last_value"]
                        }
                    },
                    "key": {"type": "string"},
                    "last_connexion_date": {"type": "integer"}
                },
                "required": ["id", "manufacturer", "serial_number", "name", "creation_date", "class", "software_version", "capabilities", "key", "last_connexion_date"]
            };
            // log4n.object(dbSchema, 'dbSchema');
            let validate = ajv.compile(dbSchema);

            log4n.debug('validation schema');
            validate(data)
                .then(valid => {
                    // log4n.object(valid, 'valid');
                    if (typeof valid.id !== 'undefined') result.id = valid.id;
                    if (typeof valid.manufacturer !== 'undefined') result.manufacturer = valid.manufacturer;
                    if (typeof valid.serial_number !== 'undefined') result.serial_number = valid.serial_number;
                    if (typeof valid.name !== 'undefined') result.name = valid.name;
                    if (typeof valid.creation_date !== 'undefined') result.creation_date = valid.creation_date;
                    if (typeof valid.class !== 'undefined') result.class = valid.class;
                    if (typeof valid.software_version !== 'undefined') result.software_version = valid.software_version;
                    if (typeof valid.capabilities !== 'undefined') result.capabilities = valid.capabilities;
                    if (typeof valid.key !== 'undefined') result.key = valid.key;
                    if (typeof valid.last_connexion_date !== 'undefined') result.last_connexion_date = valid.last_connexion_date;

                    log4n.debug('done - ok');
                    // log4n.object(result,'result');
                    resolve(result);
                })
                .catch(error => {
                    reject(errorparsing({
                        error_code: 500,
                        error_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                    }));
                });
        } catch (error) {
            log4n.object(error, 'error');
            reject(errorparsing(error));
        }
    });
};

module.exports = Converter;