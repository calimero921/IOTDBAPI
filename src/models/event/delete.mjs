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

import mongoDelete from '../../Libraries/MongoDB/deleteall.mjs';

export default function (context, id) {
    const logger = serverLogger.child({
        source: '/models/device/delete.mjs',
        httpRequestId: context.httpRequestId
    });

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        let query = {};
        if (typeof id === 'undefined') {
            reject(errorParsing(context, {status_code: 400}));
            logger.debug('done - missing paramater');
        } else {
            query.device_id = id;
            mongoDelete(context, 'event', query)
                .then(datas => {
                    //logger.debug('datas: %s', datas);
                    if (typeof datas === 'undefined') {
                        reject(errorParsing(context, {status_code: 500}));
                        logger.debug('done - no reult');
                    } else {
                        if (typeof datas.status_code === 'undefined') {
                            resolve(datas);
                            logger.debug('done - ok');
                        } else {
                            reject(errorParsing(context, datas));
                            logger.debug('done - response error');
                        }
                    }
                })
                .catch(error => {
                    logger.error('error: %j', error);
                    reject(error);
                });
        }
    });
};
