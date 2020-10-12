const mongoDelete = require('../../connectors/mongodb/delete.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, id, token) {
    const logger = serverLogger.child({
        source: '/models/account/delete.js',
        httpRequestId: context.httpRequestId
    });
    logger.debug(id, 'id');
    logger.debug(token, 'token');

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        if (id) {
            let query = {id: id, token: token};
            mongoDelete(context, 'account', query)
                .then(deletedAccount => {
                    if (deletedAccount.status_code) {
                        logger.debug('error: %j', deletedAccount);
                        reject(errorParsing(context, deletedAccount));
                    } else {
                        resolve(deletedAccount);
                    }
                })
                .catch(error => {
                    logger.debug('error: %j', error);
                    reject(error);
                })
        } else {
            let error = errorParsing(context, {status_code: 400,status_message:'missing paramater'})
            logger.debug('error: %j', error);
            reject(error);
        }
    })
};
