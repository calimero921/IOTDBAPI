const Validator = require('../../utils/Validator.js');

const accountJsonSchema = 'account/utils/accountjs.json';
const accountMongoSchema = 'account/utils/accountdb.json';

const serverLogger = require('../../../utils/ServerLogger.js');

const globalPrefix = '/models/account/utils/validator';

class AccountValidator  extends Validator {
    constructor(context) {
        super(context, accountJsonSchema, accountMongoSchema);

        this.context = context;
        let logger = serverLogger.child({
            source: globalPrefix + ':constructor:',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        logger.debug('AccountValidator created');
    }
}

module.exports = AccountValidator;