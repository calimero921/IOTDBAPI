/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const mongoFind = require('../../connectors/mongodb/find.js');
const mongoUpdate = require('../../connectors/mongodb/update.js');
const Converter = require('./utils/Converter.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, id, token, newAccount) {
    const logger = serverLogger.child({
        source: '/models/account/patch.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('id: %s', id);
            logger.debug('token: %s', token);
            logger.debug('newAccount: %j', newAccount);

            if (id && token && newAccount) {
                let converter = new Converter(context);
                let filter = {id: id, token: token};
                let parameters = {offset: 0, limit: 0};
                let updateAccount = {};
                converter.json2db(newAccount)
                    .then(convertedAccount => {
                        logger.debug('convertedAccount: %j', convertedAccount);
                        if (convertedAccount.status_code) {
                            return convertedAccount;
                        } else {
                            updateAccount = convertedAccount;
                            return mongoFind(context, 'account', filter, parameters, true)
                        }
                    })
                    .then(foundAccount => {
                        logger.debug('foundAccount: %j', foundAccount);
                        if (foundAccount.status_code) {
                            return foundAccount;
                        } else {
                            if (foundAccount.length > 0) {
                                return mongoUpdate(context, 'account', filter, updateAccount);
                            } else {
                                return errorParsing(context, {status_code: 404});
                            }
                        }
                    })
                    .then(updatedAccount => {
                        logger.debug('updatedAccount: %j', updatedAccount);
                        if (updatedAccount.status_code) {
                            return updatedAccount;
                        } else {
                            return converter.db2json(updatedAccount);
                        }
                    })
                    .then(convertedUpdatedAccount => {
                        if (convertedUpdatedAccount.status_code) {
                            logger.error('error: %j', convertedUpdatedAccount);
                            reject(convertedUpdatedAccount);
                        } else {
                            logger.debug('convertedUpdatedAccount: %j', convertedUpdatedAccount);
                            resolve(convertedUpdatedAccount);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    })
            } else {
                let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'})
                logger.error('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
};
