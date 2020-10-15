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