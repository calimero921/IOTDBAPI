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

const serverLogger = require('./serverLogger.js');
const errorParsing = require('./errorParsing.js');

module.exports = function (context) {
    const logger = serverLogger.child({
        source: '/utils/password.js',
        httpRequestId: context.httpRequestId
    });

    return new Promise(function (resolve, reject) {
        try {
            const refstr = "0123456789abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let value = "";
            let passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

            while (!value.match(passw)) {
                value = "";
                for (let i = 0; i < 16; i++) {
                    value += refstr.substr(Math.round(Math.random() * refstr.length), 1);
                }
            }
            resolve(value);
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};
