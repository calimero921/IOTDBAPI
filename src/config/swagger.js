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

const path = require('path');

const packageJSON = require('../../package.json');
const serverConfig = require('./server.js');

module.exports = {
    name:'swagger',
    status: true,
    swaggerDefinition: {
        info: {
            description: '',
            title: '',
            version: '',
        },
        host: '',
        basePath: '/',
        produces: [
            'application/json',
            'application/xml'
        ],
        contact: {
            name: packageJSON.author.name,
            email: packageJSON.author.email
        }
    },
    basedir: __dirname, //app absolute path
    files: [path.join(process.cwd(),'src', 'controllers','**','*.js')] //Path to the API handle folder
};
