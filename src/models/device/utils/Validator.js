const Validator = require('../../utils/Validator.js');

const deviceJsonSchema = 'device/utils/devicejs.json';
const deviceMongoSchema = 'device/utils/devicedb.json';

const serverLogger = require('../../../utils/ServerLogger.js');

const globalPrefix = '/models/device/utils/validator';

class DeviceValidator  extends Validator {
    constructor(context) {
        super(context, deviceJsonSchema, deviceMongoSchema);

        this.context = context;
        let logger = serverLogger.child({
            source: globalPrefix + ':constructor:',
            httpRequestId: context.httpRequestId
        });

        logger.debug('DeviceValidator created');
    }
}

module.exports = DeviceValidator;