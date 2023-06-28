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

const packageJSON = require('../../package.json');

module.exports = {
    name: 'IOTDB-API',
    description: 'API to access IOTDB application',
    protocol: '',
    hostname: '',
    port: 0,
    api_version: `v${packageJSON.version.split('.')[0]}`,
    httpsCa: '',
    httpsPrivateKey: '',
    httpsCertificate: '',
    session_timeout: 3600000,
    swagger: packageJSON.version,
};