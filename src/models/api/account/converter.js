const Ajv = require('ajv');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

function Converter() {
}

Converter.prototype.json2db = function (data) {
    const log4n = new Log4n('/models/api/account/converter/json2db');
    // log4n.object(data,'data');

    return new Promise(function (resolve, reject) {
        try {
            let result = {};
            let ajv = new Ajv();
            require('ajv-async')(ajv);

            let jsonSchema = {
                "$async": true,
                "type": "object",
                "properties": {
                    "id": {"type": "string", "format": "uuid"},
                    "firstname": {"type": "string"},
                    "lastname": {"type": "string"},
                    "email": {"type": "string"},
                    "login": {"type": "string"},
                    "password": {"type": "string"},
	                "admin": {"type": "boolean"},
                    "active": {"type": "boolean"},
                    "session_id": {"type": "string"},
                    "creation_date": {"type": "integer"},
                    "current_connexion_date": {"type": "integer"},
                    "last_connexion_date": {"type": "integer"},
                    "token": {"type": "string"}
                },
                "required": ["firstname", "lastname", "email", "password"]
            };

            // log4n.object(jsonSchema, 'jsonSchema');
            let validate = ajv.compile(jsonSchema);

            validate(data)
                .then(valid => {
                    // log4n.object(valid, 'valid');
                    if (typeof data !== 'undefined') {
                        if (typeof valid.id !== 'undefined') result.id = valid.id;
                        result.firstname = valid.firstname;
                        result.lastname = valid.lastname;
                        result.email = valid.email;
                        result.login = valid.login;
                        result.password = valid.password;
                        if (typeof valid.session_id !== 'undefined') result.session_id = valid.session_id;
                        if (typeof valid.admin !== 'undefined') result.admin = valid.admin;
	                    if (typeof valid.active !== 'undefined') result.active = valid.active;
                        if (typeof valid.creation_date !== 'undefined') result.creation_date = valid.creation_date;
                        if (typeof valid.current_connexion_date !== 'undefined') result.current_connexion_date = valid.current_connexion_date;
                        if (typeof valid.last_connexion_date !== 'undefined') result.last_connexion_date = valid.last_connexion_date;
                        if (typeof valid.token !== 'undefined') result.token = valid.token;
                    }

                    log4n.object(result, 'result');
                    log4n.debug('done - ok');
                    resolve(result);
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
    const log4n = new Log4n('/models/api/account/converter/db2json');
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
                    "firstname": {"type": "string"},
                    "lastname": {"type": "string"},
                    "email": {"type": "string"},
                    "login": {"type": "string"},
                    "password": {"type": "string"},
                    "admin" : {"type":"boolean"},
	                "active": {"type": "boolean"},
                    "session_id": {"type": "string"},
                    "creation_date": {"type": "integer"},
                    "current_connexion_date": {"type": "integer"},
                    "last_connexion_date": {"type": "integer"},
                    "token": {"type": "string"}
                },
                "required": ["id", "firstname", "lastname", "email", "login", "password", "admin", "active", "session_id", "creation_date", "current_connexion_date", "last_connexion_date", "token"]
            };
            // log4n.object(dbSchema, 'dbSchema');
            let validate = ajv.compile(dbSchema);

            log4n.debug('validation schema');
            validate(data)
                .then(valid => {
                    // log4n.object(valid, 'valid');
                    result.id = valid.id;
                    result.firstname = valid.firstname;
                    result.lastname = valid.lastname;
                    result.email = valid.email;
                    result.login = valid.login;
                    result.password = valid.password;
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

module.exports = Converter;