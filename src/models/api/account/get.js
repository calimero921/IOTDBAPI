const mongoFind = require('../../../connectors/mongodb/find.js');
const Converter = require('./utils/converter.js');

const serverLogger = require('../../../utils/serverLogger.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, query, skip, limit, overtake) {
    const logger = serverLogger.child({
        source: '/models/api/account/get.js',
        httpRequestId: context.httpRequestId
    });

    logger.debug('query: %s', query);
    logger.debug('skip: %s', skip);
    if (typeof limit === 'undefined') limit = 0;
    logger.debug('limit: %s', limit);
    if (typeof skip === 'undefined') skip = 0;
    logger.debug('overtake: %s', overtake);
    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        const converter = new Converter(context);
        let parameter = {"skip": skip, "limit": limit};
        mongoFind(context, converter, 'account', query, parameter, overtake)
            .then(datas => {
                if (datas.length > 0) {
                    resolve(datas);
                } else {
                    if (overtake) {
                        resolve(errorparsing(context, {status_code: 404}));
                        logger.debug('done - no result but ok');
                    } else {
                        reject(errorparsing(context, {status_code: 404}));
                        logger.debug('done - not found');
                    }
                }
            })
            .catch(error => {
                logger.debug('error: %j', error);
                reject(errorparsing(context, error));
            });
    });
};
