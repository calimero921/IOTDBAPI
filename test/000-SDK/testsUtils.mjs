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

import fs from 'fs';
import path from 'path';

import serverLogger from 'lib-server-logger';
import config from './getconfig.mjs';
import configuration from '../../src/config/Configuration.mjs';

const CERTCLIENT = 0;
const CERTHACKER = 1;
const CERTFAKE = 2;

class TestsUtils {
    constructor(){
        console.log("Testsutils:constructor");
        this.app = undefined;
        this.serverUrl = undefined;
        this.serverUrlVersion = undefined;
        this.configuration = configuration;

        if (this.configuration.server.protocol && this.configuration.server.hostname) {
            this.serverUrl = configuration.server.protocol + '://' + this.configuration.server.hostname
        }
        if (this.serverUrl && configuration.server.port) {
            this.serverUrl = this.serverUrl + ':' + this.configuration.server.port;
        }
        this.serverUrlVersion = this.serverUrl + '/' + this.configuration.server.api_version;
    }

    startServer() {
        return new Promise((resolve) => {
            serverLogger.initialize(configuration.logs);
            if (this.app === undefined) {
                console.log("app never started. Start the app.");
                if (config.server.active) {
                    console.log("Wait server starting");
                    import app from '../../src/server.js';
                    this.app = app;
                    setTimeout(() => {
                        console.log("Server started");
                        resolve();
                        //resolve(this.app);
                    }, 2000);
                } else {
                    console.log("Start with external server");
                    resolve();
                    //resolve(this.app);
                }
            } else {
                console.log("app already started. Return the app.");
                resolve();
                //resolve(this.app);
            }
        })
    }

    getServer() {
        return this.app;
    }

    getServerUrl() {
        return this.serverUrl;
    }

    getServerUrlVersion() {
        return this.serverUrlVersion;
    }

    getConfiguration() {
        return this.configuration;
    }

    defineRandomValue() {
        const rand = ((Math.random() * 1000) | 1);
        return String(Date.now()) + ("0000" + rand).substring(("0000" + rand).length - 3);
    }

    httpsClientOptions() {
        return getCerts(CERTCLIENT);
    }

    httpsHackerOptions() {
        return getCerts(CERTHACKER);
    }

    httpsFakeOptions() {
        return getCerts(CERTFAKE);
    }
}

function getCerts(client) {
    let certsPath = path.join(process.cwd(), 'test', '000-certificate').toString();
    let certsFiles;

    switch (client) {
        case CERTCLIENT:
            certsFiles = config.certs.client;
            break;
        case CERTHACKER:
            certsFiles = config.certs.hacker;
            break;
        case CERTFAKE:
            certsFiles = config.certs.fake;
            break;
        default:
            certsFiles = {
                ca: "",
                key: "",
                crt: ""
            };
            break;
    }

    let caPath;
    if (certsFiles.ca.startsWith('/')) {
        caPath = certsFiles.ca;
    } else {
        caPath = path.join(certsPath, config.certs.client.ca);
    }

    let keyPath;
    if (certsFiles.key.startsWith('/')) {
        keyPath = certsFiles.key;
    } else {
        keyPath = path.join(certsPath, certsFiles.key);
    }

    let crtPath;
    if (certsFiles.crt.startsWith('/')) {
        crtPath = certsFiles.crt;
    } else {
        crtPath = path.join(certsPath, certsFiles.crt);
    }

    return {
        ca: fs.readFileSync(caPath, 'utf-8'),
        key: fs.readFileSync(keyPath, 'utf-8'),
        cert: fs.readFileSync(crtPath, 'utf-8')
    };
}

export default new TestsUtils();
