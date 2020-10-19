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

const path = require('path');
const fs = require('fs');
const {Issuer} = require('openid-client');

const LOCALCONFIGURATIONFILE = 'openIDConnect.json';
const globalPrefix = 'OpenIDConnectConfig';

let config = undefined;

class OpenIDConnectConfig {
    constructor() {
        let prefix = globalPrefix + ":constructor";
        // console.log('%s:done', prefix);
    }

    getConfig() {
        let prefix = globalPrefix + ":getConfig";
        return new Promise((resolve, reject) => {
            try {
                // console.log('%s:configuration %j', prefix, configuration);
                if (typeof config === 'undefined') {
                    readConfig()
                        .then(configuration => {
                            config = configuration;
                            resolve(config);
                            // console.log('%s:done new configuration', prefix);
                        })
                        .catch(error => {
                            reject(error);
                            console.log('%s:error %j', prefix, error);
                        });
                } else {
                    resolve(config);
                    // console.log('%s:done previous configuration', prefix);
                }
            } catch (exception) {
                reject(exception);
                console.log('%s:exception %j', prefix, exception.stack);
            }
        });
    }
}

function readConfig() {
    let prefix = globalPrefix + ":readConfig";
    return new Promise((resolve, reject) => {
        try {
            let configuration = undefined;
            readJsonFile(LOCALCONFIGURATIONFILE)
                .then(result => {
                    // console.log('%s:result %j', prefix, result);
                    configuration = {};
                    configuration.local = result;
                    configuration.client = {
                        client_id: configuration.local.resource,
                        client_secret: configuration.local.credentials.secret
                    };
                    delete configuration.local.resource;
                    delete configuration.local.credentials.secret;
                    // console.log('%s:configuration %j', prefix, configuration);
                    return discoverOIDCServer(configuration.local);
                })
                .then(result => {
                    // console.log('%s:result ', prefix, result);
                    configuration.oidcserver = result;
                    // console.log('%s:configuration %j', prefix, configuration);
                    resolve(configuration);
                    // console.log("%s:done", prefix);
                })
                .catch(error => {
                    reject(error);
                    console.log('%s:error %j', prefix, error);
                })
        } catch (exception) {
            reject(exception);
            console.log('%s:exception %j', prefix, exception.stack);
        }
    });
}

function readJsonFile(fileName) {
    let prefix = globalPrefix + ":readJsonFile";
    return new Promise((resolve, reject) => {
        try {
            let content = fs.readFileSync(path.join(process.cwd(), fileName));
            // console.log("%s:content : %s", prefix, content);
            resolve(JSON.parse(content));
            // console.log("%s:done", prefix);
        } catch (exception) {
            reject(exception);
            console.log('%s:exception %j', prefix, exception.stack);
        }
    });
}

function discoverOIDCServer(localConfiguration) {
    let prefix = globalPrefix + ":discoverOIDCServer";
    return new Promise((resolve, reject) => {
        try {
            let discoveryUrl = localConfiguration['auth-server-url'] + '/realms/' + localConfiguration['realm'];
            // console.log('%s:discoveryUrl :%j', prefix, discoveryUrl);
            Issuer.discover(discoveryUrl)
                .then(issuer => {
                    // console.log('%s:issuer :%j', prefix, issuer.metadata);
                    resolve(issuer.metadata);
                    // console.log("%s:done", prefix);
                })
                .catch(error => {
                    reject(error);
                    console.log('%s:error %j', prefix, error);
                });
        } catch (exception) {
            reject(exception);
            console.log('%s:exception %j', prefix, exception.stack);
        }
    });
}

module.exports = OpenIDConnectConfig;