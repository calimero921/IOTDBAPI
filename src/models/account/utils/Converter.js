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

const Validator = require('./Validator.js');

const serverLogger = require('../../../Libraries/ServerLogger/ServerLogger.js');
const errorParsing = require('../../../utils/errorParsing.js');

const globalPrefix = '/models/account/utils/converter';

class Converter {
    constructor(context) {
        this.context = context;
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('Converter created');
        this.validator = new Validator(context);
    }

    json2db(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':json2db',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', data);
                let result = {};

                logger.debug('schema validation');
                this.validator.jsonValidator(data)
                    .then(valid => {
                        logger.debug('valid: %j', valid);
                        if (data) {
                            if (valid.id) result.id = valid.id;
                            result.firstname = valid.firstname;
                            result.lastname = valid.lastname;
                            result.email = valid.email;
                            if (valid.session_id) result.session_id = valid.session_id;
                            if (valid.admin) result.admin = valid.admin;
                            if (valid.active) result.active = valid.active;
                            if (valid.creation_date) result.creation_date = valid.creation_date;
                            if (valid.current_connexion_date) result.current_connexion_date = valid.current_connexion_date;
                            if (valid.last_connexion_date) result.last_connexion_date = valid.last_connexion_date;
                            if (valid.token) result.token = valid.token;
                        }

                        logger.debug('result: %j', result);
                        resolve(result);
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(error);
                    });
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorParsing(this.context, error));
            }
        });
    }

    db2json(data) {
        const logger = serverLogger.child({
            source: globalPrefix + ':db2json',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try {
                logger.debug('data: %j', data);
                let result = {};

                logger.debug('schema validation');
                this.validator.mongoValidator(data)
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
                        reject(errorParsing(this.context, {
                            status_code: 500,
                            status_message: error.message + " (" + error.errors[0].dataPath + " " + error.errors[0].message + ")"
                        }));
                    });
            } catch (exception) {
                logger.debug('exception: %s', exception.stack);
                reject(errorParsing(this.context, error));
            }
        });
    }
}

module.exports = Converter;