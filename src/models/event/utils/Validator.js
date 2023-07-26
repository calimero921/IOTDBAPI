/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2023 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const Validator = require('../../utils/Validator.old.js');

const deviceJsonSchema = 'event/utils/EventJsonSchema.json';
const deviceMongoSchema = 'event/utils/EventDBSchema.json';

const {serverLogger} = require('server-logger');;

const globalPrefix = '/models/event/utils/validator';

class EventValidator  extends Validator {
    constructor(context) {
        super(context, deviceJsonSchema, deviceMongoSchema);

        this.context = context;
        let logger = logger.child({
            source: globalPrefix + ':constructor:',
            httpRequestId: context.httpRequestId
        });

        logger.debug('EventValidator created');
    }
}

module.exports = EventValidator;