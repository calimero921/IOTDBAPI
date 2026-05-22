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

import serverLogger from 'lib-server-logger';
import errorParsing from '../../utils/errorParsing.mjs';

import mongoDelete from '../../Libraries/MongoDB/delete.mjs';

export default function (context, id) {
    const logger = serverLogger.child({
        source: '/models/account/delete.mjs',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('id: %s', id);
            if (id) {
                let query = {id: id};
                mongoDelete(context, 'account', query)
                    .then(deletedAccount => {
                        if (deletedAccount.status_code) {
                            logger.error('error: %j', deletedAccount);
                            reject(deletedAccount);
                        } else {
                            logger.debug('deletedAccount: %j', deletedAccount);
                            resolve(deletedAccount);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(error);
                    })
            } else {
                let error = errorParsing(context, {status_code: 400, status_message: 'missing paramater'})
                logger.debug('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
};
