const Validator = require('../../utils/Validator.js');

const deviceJsonSchema = 'event/utils/eventjs.json';
const deviceMongoSchema = 'event/utils/eventdb.json';

const serverLogger = require('../../../utils/ServerLogger.js');

const globalPrefix = '/models/event/utils/validator';

class EventValidator  extends Validator {
    constructor(context) {
        super(context, deviceJsonSchema, deviceMongoSchema);

        this.context = context;
        let logger = serverLogger.child({
            source: globalPrefix + ':constructor:',
            httpRequestId: context.httpRequestId
        });

        logger.debug('EventValidator created');
    }
}

module.exports = EventValidator;