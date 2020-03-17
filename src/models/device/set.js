const mongoInsert = require('../../connectors/mongodb/insert.js');
const Converter = require('./utils/Converter.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, device) {
    const logger = serverLogger.child({
        source: '/models/device/set.js',
        httpRequestId: context.httpRequestId
    });

    //traitement d'enregistrement dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('device: %j', device);
            const converter = new Converter(context);
            if (typeof device === 'undefined') {
                let error = errorparsing({status_code: '400', status_message: 'Missing parameter'});
                logger.error('error: %j', error);
                reject(error);
            } else {
                converter.json2db(device)
                    .then(query => {
                        logger.debug('query: %j', query);
                        return mongoInsert(context, 'device', query);
                    })
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            return converter.db2json(datas[0]);
                        } else {
                            let error = errorparsing(context, 'No datas inserted');
                            logger.error('error: %j', error);
                            return (error);
                        }
                    })
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                reject(datas);
                            } else {
                                resolve(datas);
                            }
                        } else {
                            let error = errorparsing(context, 'No datas converted');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    })
                    .catch(error => {
                        logger.error('error: %j', error);
                        reject(error);
                    });
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};