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

const https = require('https');
const http = require('http');
const {URL} = require('url');

const globalPrefix = 'OpenIDConnectHTTPClient';

class OpenIDConnectHTTPClient {
    constructor(configuration) {
        let prefix = globalPrefix + ":constructor";
        this.configuration = configuration;
    }

    introspection(accessToken) {
        let prefix = globalPrefix + ":introspection";
        return new Promise((resolve, reject) => {
            try {
                // console.log("%s:configuration %j", prefix, this.configuration);
                // console.log("%s:encodedAccessToken %j", prefix, encodedAccessToken);

                let credentials = Buffer.from(this.configuration.client.client_id + ':' + this.configuration.client.client_secret).toString('base64');
                let auth = 'Basic ' + credentials;
                let introspectionURL = new URL(this.configuration.oidcserver.introspection_endpoint);
                introspectionURL.searchParams.append('token_type_hint', 'requesting_party_token');
                introspectionURL.searchParams.append('token', accessToken);
                // console.log('%s: introspectionURL ', prefix, introspectionURL);

                let jsonObject = introspectionURL.search.replace('?', '');
                // console.log("%s:jsonObject %j", prefix, jsonObject);

                genericHTTPRequest('POST', introspectionURL, auth, jsonObject)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(error => {
                        console.log('%s:error %j', prefix, error);
                    });
            } catch (exception) {
                console.log('%s:exception ', prefix, exception.stack);
                reject(exception);
            }
        });
    }

    jwksuri() {
        let prefix = globalPrefix + ":userinfo";
        return new Promise((resolve, reject) => {
            try {
                let JWKSURL = new URL(this.configuration.oidcserver.jwks_uri);
                genericHTTPRequest('GET', JWKSURL)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(error => {
                        console.log('%s:error %j', prefix, error);
                    });
            } catch (exception) {
                console.log('%s:exception ', prefix, exception.stack);
                reject(exception);
            }
        });
    }

    userinfo(bearer) {
        let prefix = globalPrefix + ":userinfo";
        return new Promise((resolve, reject) => {
            try {
                let userinfoURL = new URL(this.configuration.oidcserver.userinfo_endpoint);
                genericHTTPRequest('GET', userinfoURL, bearer)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(error => {
                        console.log('%s:error %j', prefix, error);
                    });
            } catch (exception) {
                console.log('%s:exception ', prefix, exception.stack);
                reject(exception);
            }
        });
    }
}

function genericHTTPRequest(verb, url, auth, body = undefined) {
    let prefix = globalPrefix + ":genericHTTPRequest";
    return new Promise((resolve, reject) => {
        try {
            const options = {
                host: url.hostname,
                port: url.port,
                path: url.pathname,
                method: verb.toUpperCase(),
                headers: {
                    'Accept': 'application/json'
                }
            };
            // console.log('%s:options ', prefix, options);
            if (typeof body !== 'undefined') {
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                options.headers['Content-Length'] = Buffer.byteLength(body);
            }
            if (typeof auth !== 'undefined') {
                options.headers['Authorization'] = auth;
            }

            let HTTPClient = undefined;
            switch (url.protocol) {
                case 'http':
                    HTTPClient = http;
                    break;
                case 'https':
                    HTTPClient = https;
                    options.rejectUnauthorized = false;
                    break;
                default:
                    HTTPClient = http;
                    break;
            }
            let callReturn = "";
            const request = HTTPClient.request(options, response => {
                response.setEncoding('utf8');
                response.on('end', () => {
                    // console.log('%s:callReturn ', prefix, callReturn);
                    let result = JSON.parse(callReturn);
                    resolve(result);
                });
                response.on('data', (chunk) => {
                    // console.log('%s:chunk ', prefix, chunk);
                    if (typeof chunk === 'undefined') throw('chunk empty');
                    if (typeof callReturn === 'undefined') callReturn = "";
                    callReturn = callReturn + chunk;
                });

            });
            request.on('error', (error) => {
                console.log('%s:error %j', prefix, error);
                reject(error);
            });
            if (typeof body !== 'undefined') {
                request.write(body);
            }
            request.end();
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
            reject(exception);
        }
    });
}

module.exports = OpenIDConnectHTTPClient;