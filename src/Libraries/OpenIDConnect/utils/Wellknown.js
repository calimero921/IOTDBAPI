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

const apiGet = require('../baseapi/get.js');
const errorParsing = require('../utils/errorParsing.js');

const globalPrefix = '/Libraries/OpenIDConnect/utils/Wellknown.js';

class Wellknown {
    constructor(options, server_logger) {
        this.options = options;
        this.serverLogger = server_logger;

        let context = {httpRequestId: 'initialize'};
        let logger = this.serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        logger.debug('Creating OpenIDConnect connector');
        this.apiWellknown = undefined;
        logger.debug('Created OpenIDConnect connector');
    }

    get(context) {
        const logger = this.serverLogger.child({
            source: globalPrefix + ':get',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });

        return new Promise((resolve, reject) => {
            try{
                logger.debug('Getting OIDC wellknown');
                if (this.apiWellknown) {
                    logger.debug('wellknown: %j', this.apiWellknown);
                    resolve(this.apiWellknown);
                } else {
                    logger.debug('wellknown path: %j', this.options.routes.wellknown);
                    apiGet(context, this.serverLogger, this.options, this.options.routes.wellknown)
                        .then(response => {
                            // logger.debug('response: %j', response);
                            this.apiWellknown = response;
                            // logger.debug('wellknown: %j', this.apiWellknown);
                            resolve(this.apiWellknown);
                        })
                        .catch(error => {
                            logger.debug('error: %j', error);
                            reject(errorParsing(context, error));
                        })
                }
            } catch(exception) {
                logger.debug('error: %s', exception.stack);
                reject(errorParsing(context, exception));
            }
        });
    }
}

module.exports = Wellknown;