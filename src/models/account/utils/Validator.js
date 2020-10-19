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