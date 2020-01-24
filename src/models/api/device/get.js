const mongoFind = require('../../../connectors/mongodb/mongodbfind.js');
const Converter = require('./converter.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, query, offset, limit, overtake) {
    const log4n = new Log4n(context, '/models/api/device/get');
    log4n.object(query, 'query');
    log4n.object(offset, 'offset');
    log4n.object(limit, 'limit');
    log4n.object(overtake, 'overtake');

    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        const converter = new Converter(context);
        let parameter = {};
        if (typeof limit !== 'undefined') parameter.limit = limit;
        if (typeof offset !== 'undefined') parameter.offset = offset;
        mongoFind(context, converter,'device', query, parameter, overtake)
            .then(datas => {
                // log4n.object(datas, 'datas');
                if (datas.length > 0) {
                    resolve(datas);
                } else {
                    if (overtake) {
                        log4n.debug('done - no result but ok');
                        resolve(errorparsing(context, {status_code: 404}));
                    } else {
                        log4n.debug('done - not found');
                        reject(errorparsing(context, {status_code: 404}));
                    }
                }
            })
            .catch(error => {
                log4n.object(error, 'error');
                reject(errorparsing(context, error));
                log4n.debug('done - global catch');
            });
    });
};
