/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

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