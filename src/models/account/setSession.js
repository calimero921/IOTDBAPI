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

const moment = require('moment');

const patchAccount = require('./patch.js');
const getAccount = require('./get.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

let globalPrefix = '/models/account/setSession.js';

module.exports = function (context, id, token, session_id) {
    const logger = serverLogger.child({
        source: globalPrefix,
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    return new Promise((resolve, reject) => {
        try {
            logger.debug('id: %s', id);
            logger.debug('token: %s', token);
            logger.debug('session_id: %s', session_id);
            if (id && session_id) {
                getAccount(context, {id: id, token: token}, 0, 0, false)
                    .then(foundAccount => {
                        logger.debug( 'foundAccount: %j', foundAccount);
                        let newAccount = foundAccount[0];
                        newAccount.session_id = session_id;
                        newAccount.last_connexion_date = newAccount.current_connexion_date;
                        newAccount.current_connexion_date = parseInt(moment().format('x'));
                        logger.debug( 'newAccount: %j', newAccount);
                        return patchAccount(context, id, token, newAccount);
                    })
                    .then(patchedAccount => {
                        if (patchedAccount) {
                            if (patchedAccount.status_code) {
                                logger.error('error: %j', patchedAccount);
                                reject(patchedAccount);
                            } else {
                                logger.debug('patchedAccount: %j', patchedAccount);
                                resolve(patchedAccount);
                            }
                        } else {
                            let error = errorParsing(context, 'no data');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    });
            } else {
                let error = errorParsing(context, {status_code: 400, status_message: 'missing parameter'});
                logger.error('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.error( 'exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};
