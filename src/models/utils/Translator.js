/**
 * Orange DIOD IAM API
 *
 * Copyright (C) 2019 - 2021 Orange
 *
 * This software is confidential and proprietary information of Orange.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * If you are Orange employee you shall use this software in accordance with
 * the Orange Source Charter (http://opensource.itn.ftgroup/index.php/Orange_Source).
 *
 * @author SOFT Pessac
 */

'use strict';

const moment = require('moment');
const crypto = require('crypto');

const configuration = require('../../config/Configuration.js');
const serverLogger = require('../../Libraries/ServerLogger/ServerLogger.js');

const globalPrefix = '/models/utils/Translator.js';

class Translator {
    constructor(context) {
        this.context = context;
        const logger = serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        logger.debug('Translator instance created');
    }

    toBoolean(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':fromBoolean',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        switch (value) {
            case null:
                result = null;
                break;
            case 'true':
            case 'TRUE':
            case true:
                result = true;
                break;
            case 'false':
            case 'FALSE':
            case false:
            default:
                result = false;
                break;
        }
        logger.debug('result: %j', result);
        return result;
    }

    fromBoolean(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':toBoolean',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        switch (value) {
            case null:
                result = null;
                break;
            case 'false':
            case 'FALSE':
            case false:
                result = 'FALSE';
                break;
            case 'true':
            case 'TRUE':
            case true:
            default:
                result = 'TRUE';
                break;
        }
        logger.debug('result: %j', result);
        return result;
    }

    toLdapCN(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':fromLdapCN',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;

        if (value === null) {
            result = null;
        } else {
            if (value) {
                const ldapPath = value.split(',');
                if (ldapPath.length > 1) {
                    const keyVal = ldapPath[0].split('=');
                    if ((keyVal.length === 2) && (keyVal[0] === 'cn')) {
                        result = keyVal[1];
                    }
                }
            }
        }

        logger.debug('result: %j', result);
        return result;
    }

    fromLdapCN(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':toLdapCN',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;

        if (value === null) {
            result = null;
        } else {
            if (value) {
                result = `cn=${value},${configuration.ldap.basedn.userOu}`;
            }
        }

        logger.debug('result: %j', result);
        return result;
    }

    toInteger(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':toInteger',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        if (value === null) {
            result = null;
        } else {
            if (value) {
                result = parseInt(value);
            }
        }
        logger.debug('result: %j', result);
        return result;
    }

    fromInteger(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':fromInteger',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        if (value === null) {
            result = null;
        } else {
            if (value) {
                result = value.toString();
            }
        }

        logger.debug('result: %j', result);
        return result;
    }

    toArray(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':toInteger',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        if (value === null) {
            result = null;
        } else {
            if (value) {
                if (Array.isArray(value)) {
                    result = value;
                } else {
                    result = [];
                    result.push(value);
                }
            }
        }

        logger.debug('result: %j', result);
        return result;
    }

    fromArray(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':fromInteger',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        const result = value;

        logger.debug('result: %j', result);
        return result;
    }

    toDate(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':fromDate',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        if (value === null) {
            result = null;
        } else {
            const dateValue = value.substring(0, 8);
            logger.debug('dateValue: %j', dateValue);

            if (moment(dateValue).isValid()) {
                result = moment(dateValue, 'YYYYMMDD000000.000ZZ').format('YYYY-MM-DD');
            } else {
                logger.error('invalid format');
            }
        }
        logger.debug('result: %j', result);
        return result;
    }

    fromDate(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':toDate',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('value: %j', value);
        let result;
        if (value === null) {
            result = null;
        } else {
            if (moment(value).isValid()) {
                result = moment(value, 'YYYY-MM-DD').format('YYYYMMDD000000.000ZZ');
            } else {
                logger.error('invalid format');
            }
        }
        logger.debug('result: %j', result);
        return result;
    }

    toPassword() {
        const logger = serverLogger.child({
            source: globalPrefix + ':fromPassword',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        const result = '**********';
        logger.debug('result: %j', result);
        return result;
    }

    fromPassword(value) {
        const logger = serverLogger.child({
            source: globalPrefix + ':toPassword',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('password: %j', value);
        let result;

        if (value === null) {
            result = null;
        } else {
            if (value) {
                let algorithm;
                let algName;
                let saltString;
                switch (configuration.constants.passwd_hash_alg) {
                    case 'md5':
                        algorithm = 'md5';
                        algName = 'MD5';
                        saltString = '';
                        break;
                    case 'smd5':
                        algorithm = 'md5';
                        algName = 'SMD5';
                        saltString = generateSalt(this.context);
                        break;
                    case 'sha':
                    case 'sha-1':
                        algorithm = 'sha1';
                        algName = 'SHA'
                        saltString = '';
                        break;
                    case 'ssha':
                    case 'ssha-1':
                        algorithm = 'sha1';
                        algName = 'SSHA'
                        saltString = generateSalt(this.context);
                        break;
                    case 'sha-256':
                        algorithm = 'sha256';
                        algName = 'SHA256'
                        saltString = '';
                        break;
                    case 'ssha-256':
                        algorithm = 'sha256';
                        algName = 'SSHA256'
                        saltString = generateSalt(this.context);
                        break;
                    case 'sha-384':
                        algorithm = 'sha384';
                        algName = 'SHA384'
                        saltString = '';
                        break;
                    case 'ssha-384':
                        algorithm = 'sha384';
                        algName = 'SSHA384'
                        saltString = generateSalt(this.context);
                        break;
                    case 'sha-512':
                        algorithm = 'sha512';
                        algName = 'SHA512'
                        saltString = '';
                        break;
                    case 'ssha-512':
                        algorithm = 'sha512';
                        algName = 'SSHA512'
                        saltString = generateSalt(this.context);
                        break;
                    default:
                        algorithm = undefined;
                        saltString = '';
                        break;
                }

                if (algorithm) {
                    const hash = crypto.createHash(algorithm);
                    hash.update(value);
                    const salt = new Buffer.from(saltString);
                    hash.update(salt);
                    const hashPwd = hash.digest();
                    logger.debug('hashPwd: %j', hashPwd.toString('hex'));
                    result = '{' + algName + '}' + Buffer.concat([hashPwd, salt]).toString('base64');
                } else {
                    result = value;
                }
            }
        }

        // logger.debug('result: %j', result);
        return result;
    }
}

function generateSalt(context) {
    const logger = serverLogger.child({
        source: globalPrefix + ':generateSalt',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.debug('generating Salt');
    let saltString = '';

    const saltReference = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ?!+-*/=';
    const minSaltLength = 8;
    const maxSaltLength = 32;

    const saltLength = minSaltLength + Math.round(Math.random() * (maxSaltLength - minSaltLength));
    for (let idx = 0; idx < saltLength; idx++) {
        const charPlace = Math.round(Math.random() * saltReference.length);
        // logger.debug('charPlace: %d', charPlace);
        const char = saltReference.substr(charPlace, 1)
        // logger.debug('char: %s', char);
        saltString = `${saltString}${char}`;
    }
    logger.debug('saltString: %s', saltString);
    return saltString;
}

module.exports = Translator;
