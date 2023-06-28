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

const {createLogger, format, transports} = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const config = require('../../config/Configuration.js');

class ServerLogger {
    constructor() {
        this.logger = undefined;
        this.timzeString = getTimezone();
    }

    initialize(options) {
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
                    format: 'YYYY-MM-DDTHH:mm:ss.SSS' + this.timzeString
                }),
                format.splat(),
                format.printf(info => `${info.timestamp} - [${info.authorizedClient}] - [${info.httpRequestId}] - ${info.level.toUpperCase()} - ${info.source} - ${info.message}`)
            ),
            transports: loggerTransport
        };
        this.logger = createLogger(loggerOptions);
    }

    child(options) {
        return this.logger.child(options);
    }
}

function getTimezone() {
    try {
        let timezoneString = '';
        const timezoneOffset = new Date().getTimezoneOffset();
        if (timezoneOffset > 0) {
            timezoneString += '-';
        } else {
            timezoneString += '+';
        }
        let hourString = '00' + Math.floor(Math.abs(timezoneOffset) / 60).toString();
        hourString = hourString.substring(hourString.length - 2);
        timezoneString += hourString;
        timezoneString += ':';
        let minuteString = '00' + (Math.abs(timezoneOffset) % 60).toString();
        minuteString = minuteString.substring(minuteString.length - 2);
        timezoneString += minuteString;

        if (timezoneString === "+00:00" || timezoneString === "-00:00") {
            timezoneString = 'Z';
        }
        return timezoneString
    } catch (exception) {
        return '';
    }
}

module.exports = new ServerLogger();