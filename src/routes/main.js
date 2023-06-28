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

const oidcConnector = require('../Libraries/OpenIDConnect/OpenIDConnectServer.js')
const configuration = require('../config/Configuration.js');
const serverLogger = require('../Libraries/ServerLogger/ServerLogger.js');

const status = require('../controllers/status.js');

const accountGet = require('../controllers/account/getAll.js');
const accountGetByID = require('../controllers/account/getByID.js');
const accountGetByEmail = require('../controllers/account/getByEmail.js');
const accountGetBySession = require('../controllers/account/getBySession.js');
const accountPost = require('../controllers/account/post.js');
const accountPatch = require('../controllers/account/patch.js');
const accountDelete = require('../controllers/account/delete.js');

const deviceGetById = require('../controllers/device/getById.js');
const deviceGetByUser = require('../controllers/device/getByUser.js');
const deviceExists = require('../controllers/device/exists.js');
const devicePost = require('../controllers/device/post.js');
const devicePatch = require('../controllers/device/patch.js');
const deviceDelete = require('../controllers/device/delete.js');

const measureGetById = require('../controllers/event/getById.js');
const measurePost = require('../controllers/event/post.js');
const measureDelete = require('../controllers/event/delete.js');

module.exports = function (server) {
    let context = {
        httpRequestId: 'initialize',
        authorizedClient: 'internal'
    }
    const logger = serverLogger.child({
        source: '/routes/main.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.info('Router starting ...');
    logger.info('Request ID middleware');
    server.use((request, response, next) => {
        request.httpRequestId = Date.now().toString();
        next();
    });

    server.get('/status', oidcConnector.protect('openid'), status);

    server.get('/' + configuration.server.api_version + '/account', oidcConnector.protect('openid'), accountGet);
    server.get('/' + configuration.server.api_version + '/account/id/:id', oidcConnector.protect('openid'), accountGetByID);
    server.get('/' + configuration.server.api_version + '/account/email/:email', oidcConnector.protect('openid'), accountGetByEmail);
    server.get('/' + configuration.server.api_version + '/account/session/:session_id', oidcConnector.protect('openid'), accountGetBySession);
    server.post('/' + configuration.server.api_version + '/account', accountPost);
    server.patch('/' + configuration.server.api_version + '/account/:id/:token', oidcConnector.protect('openid'), accountPatch);
    server.delete('/' + configuration.server.api_version + '/account/:id/:token', oidcConnector.protect('openid'), accountDelete);

    server.get('/' + configuration.server.api_version + '/device/:id', oidcConnector.protect('openid'), deviceGetById);
    server.get('/' + configuration.server.api_version + '/device/user/:id', oidcConnector.protect('openid'), deviceGetByUser);
    server.get('/' + configuration.server.api_version + '/device/exists/:manufacturer/:model/:serial/:secret', oidcConnector.protect('openid'), deviceExists);
    server.post('/' + configuration.server.api_version + '/device', oidcConnector.protect('openid'), devicePost);
    server.patch('/' + configuration.server.api_version + '/device/:id', oidcConnector.protect('openid'), devicePatch);
    server.delete('/' + configuration.server.api_version + '/device/:id', oidcConnector.protect('openid'), deviceDelete);

    server.get('/' + configuration.server.api_version + '/event/:id', oidcConnector.protect('openid'), measureGetById);
    server.post('/' + configuration.server.api_version + '/event', oidcConnector.protect('openid'), measurePost);
    server.delete('/' + configuration.server.api_version + '/event/:id', oidcConnector.protect('openid'), measureDelete);

    logger.debug('done');
};
