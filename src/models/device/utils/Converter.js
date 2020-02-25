const Moment = require('moment');

const Generator = require('../../utils/Generator.js');
const Validator = require('./Validator.js');

const serverLogger = require('../../../utils/ServerLogger.js');
const errorparsing = require('../../../utils/errorParsing.js');

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

    json2db(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', data);
                let result = {};

                //ajout des informations générées par le serveur
                const generator = new Generator(this.context);
                data.device_id = generator.idgen();
                if (data.key === 'undefined') {
                    data.key = generator.keygen();
                }
                if (data.creation_date === 'undefined') {
                    data.creation_date = parseInt(Moment().format('x'));
                }
                if (data.last_connexion_date === 'undefined') {
                    data.last_connexion_date = parseInt(Moment().format('x'));
                }

                logger.debug('schema validation');
                logger.debug(data, 'data');
                this.validator.jsonValidator(data)
                    .then(valid => {
                        // logger.debug(valid, 'valid');
                        if (valid.device_id) result.device_id = valid.device_id;
                        if (valid.key) result.key = valid.key;
                        if (valid.user_id) result.user_id = valid.user_id;
                        if (valid.manufacturer) result.manufacturer = valid.manufacturer;
                        if (valid.model) result.model = valid.model;
                        if (valid.serial) result.serial = valid.serial;
                        if (valid.secret) result.secret = valid.secret;
                        if (valid.name) result.name = valid.name;
                        if (valid.class) result.class = valid.class;
                        if (valid.software_version) result.software_version = valid.software_version;
                        if (valid.local_ip) result.local_ip = valid.local_ip;
                        if (valid.creation_date) result.creation_date = valid.creation_date;
                        if (valid.last_connexion_date) result.last_connexion_date = valid.last_connexion_date;
                        if (valid.capabilities) {
                            result.capabilities = [];
                            for (let i in valid.capabilities) {
                                let datas = valid.capabilities[i];
                                // logger.debug(datas, 'datas');
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
                logger.error('exception: %s', exception.stack);
                reject(errorparsing(this.context, exception));
            }
        });
    }

    db2json(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':db2json',
            httpRequestId: this.context.httpRequestId
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', data);
                let result = {};

                logger.debug('schema validation');
                // logger.debug(data, 'data');
                this.validator.mongoValidator(data)
                    .then(valid => {
                        logger.debug( 'valid: %j', valid);
                        if (valid.device_id) result.device_id = valid.device_id;
                        if (valid.key) result.key = valid.key;
                        if (valid.user_id) result.user_id = valid.user_id;
                        if (valid.manufacturer) result.manufacturer = valid.manufacturer;
                        if (valid.model) result.model = valid.model;
                        if (valid.serial) result.serial = valid.serial;
                        if (valid.secret) result.secret = valid.secret;
                        if (valid.name) result.name = valid.name;
                        if (valid.creation_date) result.creation_date = valid.creation_date;
                        if (valid.class) result.class = valid.class;
                        if (valid.software_version) result.software_version = valid.software_version;
                        if (valid.local_ip) result.local_ip = valid.local_ip;
                        if (valid.creation_date) result.creation_date = valid.creation_date;
                        if (valid.last_connexion_date) result.last_connexion_date = valid.last_connexion_date;
                        if (valid.capabilities) result.capabilities = valid.capabilities;

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
                logger.error('exception: %s', exception.stack);
                reject(errorparsing(this.context, exception));
            }
        });
    }
}

module.exports = Converter;