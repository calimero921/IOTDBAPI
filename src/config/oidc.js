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

module.exports = {
    status: true,
    name: 'OpenIDConnect',
    description: 'Open ID Connect',
    protocol: '',
    hostname: '',
    port: 0,
    issuer: '',
    audience: '',
    routes: {
        "mainPath": "/realms/master",
        status: "/.well-known/openid-configuration",
        wellknown: "/.well-known/openid-configuration"
    }
};