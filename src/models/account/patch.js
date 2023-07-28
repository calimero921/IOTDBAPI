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

const mongoFind = require('../../Libraries/MongoDB/api/find.js');
const mongoUpdate = require('../../Libraries/MongoDB/api/update.js');
const Converter = require('../utils/Converter.js');

const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');

const globalPrefix = '/models/account/patch.js';

module.exports = function (context, id, newAccount) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('id: %s', id);
            logger.debug('newAccount: %j', newAccount);

            if (id && newAccount) {
                let converter = new Converter(context);
                let filter = {id: id};
                let parameters = {offset: 0, limit: 0};
                let updateAccount = {};
                converter.json2db(newAccount, converter.accountSchema)
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
                            return converter.db2json(updatedAccount, converter.accountSchema);
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

// function updateFields(context, orginal, update) {
//     const logger = serverLogger.child({
//         source: globalPrefix + 'updateFields',
//         httpRequestId: context.httpRequestId,
//         authorizedClient: context.authorizedClient
//     });
//
//     try {
//
//     } catch (exception) {
//         logger.error('exception: %s', exception.stack);
//         return errorParsing(context, exception);
//     }
// }