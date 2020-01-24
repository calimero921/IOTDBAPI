module.exports = {
    logLevel: 'debug',
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