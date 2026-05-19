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

import oidcConnector from 'lib-oidc-connector/server';
import serverLogger from 'lib-server-logger';
import configuration from '../config/Configuration.mjs';

import status from '../controllers/status.mjs';

import accountGet from '../controllers/account/getAll.mjs';
import accountGetByID from '../controllers/account/detById.mjs';
import accountGetByEmail from '../controllers/account/getByEmail.mjs';
import accountGetBySession from '../controllers/account/getBySession.mjs';
import accountPost from '../controllers/account/post.mjs';
import accountPatch from '../controllers/account/patch.mjs';
import accountDelete from '../controllers/account/delete.mjs';

import deviceGetById from '../controllers/device/getById.mjs';
import deviceGetByUser from '../controllers/device/getByUser.mjs';
import deviceExists from '../controllers/device/exists.mjs';
import devicePost from '../controllers/device/post.mjs';
import devicePatch from '../controllers/device/patch.mjs';
import deviceDelete from '../controllers/device/delete.mjs';

import measureGetById from '../controllers/event/getById.mjs';
import measurePost from '../controllers/event/post.mjs';
import measureDelete from '../controllers/event/delete.mjs';

export default function (server) {
    let context = {
        httpRequestId: 'initialize',
        authorizedClient: 'internal'
    }
    const logger = serverLogger.child({
        source: '/routes/main.mjs',
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
    server.get('/' + configuration.server.api_version + '/account/:id', oidcConnector.protect('openid'), accountGetByID);
    server.get('/' + configuration.server.api_version + '/account/email/:email', oidcConnector.protect('openid'), accountGetByEmail);
    server.get('/' + configuration.server.api_version + '/account/session/:session_id', oidcConnector.protect('openid'), accountGetBySession);
    server.post('/' + configuration.server.api_version + '/account', accountPost);
    server.patch('/' + configuration.server.api_version + '/account/:id', oidcConnector.protect('openid'), accountPatch);
    server.delete('/' + configuration.server.api_version + '/account/:id', oidcConnector.protect('openid'), accountDelete);

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
