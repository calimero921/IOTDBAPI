const mongoDelete = require('../../connectors/mongodb/delete.js');

const serverLogger = require('../../utils/ServerLogger.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context, id, token) {
    const logger = serverLogger.child({
        source: '/models/account/delete.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    //traitement de suppression dans la base
    return new Promise((resolve, reject) => {
        try {
            logger.debug(id, 'id');
            logger.debug(token, 'token');
            if (id) {
                let query = {id: id, token: token};
                mongoDelete(context, 'account', query)
                    .then(deletedAccount => {
                        if (deletedAccount.status_code) {
                            logger.error('error: %j', deletedAccount);
                            reject(deletedAccount);
                        } else {
                            logger.debug('deletedAccount: %j', deletedAccount);
                            resolve(deletedAccount);
                        }
                    })
                    .catch(error => {
                        logger.debug('error: %j', error);
                        reject(error);
                    })
            } else {
                let error = errorParsing(context, {status_code: 400, status_message: 'missing paramater'})
                logger.debug('error: %j', error);
                reject(error);
            }
        } catch (exception) {
            logger.debug('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    })
};
