const mongoFind = require('../../../connectors/mongodb/mongodbfind.js');
const Converter = require('./converter.js');

const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, query, skip, limit, overtake) {
    const log4n = new Log4n(context, '/models/api/account/get');
    log4n.object(query, 'query');
    log4n.object(skip, 'skip');
    if (typeof limit === 'undefined') limit = 0;
    log4n.object(limit, 'limit');
    if (typeof skip === 'undefined') skip = 0;
    log4n.object(overtake, 'overtake');

    if (typeof overtake === 'undefined') overtake = false;

    //traitement de recherche dans la base
    return new Promise((resolve, reject) => {
        const converter = new Converter(context);
        let parameter = {"skip" : skip, "limit" : limit};
        mongoFind(context,converter,'account', query, parameter, overtake)
            .then(datas => {
                if (datas.length > 0) {
                    resolve(datas);
                } else {
                    if (overtake) {
                        resolve(errorparsing(context, {status_code: 404}));
                        log4n.debug('done - no result but ok');
                    } else {
                        reject(errorparsing(context, {status_code: 404}));
                        log4n.debug('done - not found');
                    }
                }
            })
            .catch(error => {
                log4n.object(error, 'error');
                reject(errorparsing(context, error));
                log4n.debug('done - global catch')
            });
    });
};
