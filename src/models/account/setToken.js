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

const moment = require('moment');

const getAccount = require('./get.js');
const patchAccount = require('./patch.js');

const Generator = require('../utils/Generator.js');
const {serverLogger} = require('server-logger');
const errorParsing = require('../../utils/errorParsing.js');

let globalPrefix = '/models/account/setToken.js';

module.exports = function (context, id, token) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('id: %s', id);
            logger.debug('token: %s', token);
            if (id) {
                let newAccount;
                getAccount(context, {id: id, token: token}, 0, 0, false)
                    .then(account => {
                        logger.debug('account: %j', account[0]);
                        newAccount = account[0];
                        newAccount.last_connexion_date = newAccount.current_connexion_date;
                        newAccount.current_connexion_date = parseInt(moment().format('x'));
                        return createToken(context);
                    })
                    .then(newToken => {
                        logger.debug('newToken: %s', newToken);
                        newAccount.token = newToken;
                        return patchAccount(context, id, token, newAccount);
                    })
                    .then(patchedAccount => {
                        if (patchedAccount.status_code) {
                            logger.error('error: %j', patchedAccount);
                            reject(patchedAccount);
                        } else {
                            logger.debug('patchedAccount: %j', patchedAccount);
                            resolve(patchedAccount.token);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    })
            } else {
                let error = errorParsing({status_code: 400, status_message: 'missing parameter'})
                logger.debug('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
};

function createToken(context) {
    const logger = serverLogger.child({
        source: globalPrefix + ':createToken',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        let generator = new Generator();
        let token = generator.keygen();
        logger.debug('token: %s', token);
        getAccount(context, {token: token}, 0, 0, true)
            .then(foundAccounts => {
                logger.debug('foundAccounts: %j', foundAccounts);
                if (foundAccounts.length > 0) {
                    logger.debug('token: %s', token);
                    return createToken(context);
                } else {
                    logger.debug('no account found for this token');
                    resolve(token);
                }
            })
            .catch(error => {
                logger.error('error: %j', error);
                reject(error);
            })
    })
}