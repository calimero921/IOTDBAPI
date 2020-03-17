const mongoFind = require('../../connectors/mongodb/find.js');
const Converter = require('./utils/Converter.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, query, offset, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/device/get.js',
        httpRequestId: context.httpRequestId
    });

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('query: %s', query);
            logger.debug('offset: %s', offset);
            logger.debug('limit: %s', limit);
            if (!overtake) overtake = false;
            logger.debug('overtake: %s', overtake);

            let parameter = {};
            if (offset) parameter.offset = offset;
            if (limit) parameter.limit = limit;

            const converter = new Converter(context);
            mongoFind(context, converter, 'device', query, parameter, overtake)
                .then(datas => {
                    if (datas) {
                        if (datas.status_code) {
                            logger.error('error: %j', datas);
                            if (overtake) {
                                resolve(datas);
                            } else {
                                reject(datas);
                            }
                        } else {
                            logger.debug('datas: %j', datas);
                            resolve(datas);
                        }
                    } else {
                        let error = errorparsing(context, 'No datas found');
                        logger.error('error: %j', error);
                        reject(error);
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    reject(error);
                });
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};
