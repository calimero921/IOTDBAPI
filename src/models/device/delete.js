const mongoDelete = require('../../connectors/mongodb/delete.js');

const Log4n = require('../../utils/log4n.js');
const serverLogger = require('../../utils/ServerLogger.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, device_id) {
    const logger = serverLogger.child({
        source: '/models/device/delete.js',
        httpRequestId: context.httpRequestId
    });

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug('device_id: %s', device_id);
            let query = {};
            if (device_id) {
                query.device_id = device_id;
                mongoDelete(context, 'device', query)
                    .then(datas => {
                        logger.debug('datas: %j', datas);
                        if (datas) {
                            if (datas.status_code) {
                                logger.error('error: %j', datas);
                                reject(datas);
                            } else {
                                resolve(datas);
                            }
                        } else {
                            let error = errorparsing(context, 'No result');
                            logger.error('error: %j', error);
                            reject(error);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(error);
                    });
            } else {
                let error = errorparsing(context, {status_code: 400, status_message: 'Missing device ID'});
                logger.error('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorparsing(context, exception));
        }
    });
};
