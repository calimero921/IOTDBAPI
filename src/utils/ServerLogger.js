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

const {createLogger, format, transports} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const config = require('../config/Configuration.js');

class ServerLogger {
    constructor() {
        let loggerTransport = [];
        Object.keys(config.logs.transport).forEach(transportName => {
            let transportConf = config.logs.transport[transportName];
            if (transportConf.active) {
                let transport = undefined;
                switch (transportName) {
                    case 'console':
                        transport = new transports.Console();
                        break;
                    case 'file':
                        transport = new DailyRotateFile(transportConf.dailyLogs);
                        break;
                    default:
                        break;
                }
                if (transport) loggerTransport.push(transport);
            }
        });
        let loggerOptions = {
            level: config.logs.logLevel,
            format: format.combine(
                format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS'
                }),
                format.splat(),
                format.printf(info => `${info.timestamp} - [${info.authorizedClient}] - [${info.httpRequestId}] - ${info.level.toUpperCase()} - ${info.source} - ${info.message}`)
            ),
            transports: loggerTransport
        };
        this.loggerObject = createLogger(loggerOptions);
    }
}

module.exports = new ServerLogger().loggerObject;