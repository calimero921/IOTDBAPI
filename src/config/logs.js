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

module.exports = {
    logLevel: 'debug',
    obfuscation: {
        method: 'starred',
        size: 8
    },
    transport: {
        console: {
            active: true
        },
        file: {
            active: true,
            dailyLogs: {
                dirname: process.cwd() + '/logs',
                filename: 'IOTDBAPI-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d'
            }
        }
    }
};