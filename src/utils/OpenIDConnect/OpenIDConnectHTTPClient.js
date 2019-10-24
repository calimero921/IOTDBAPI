const https = require('https');
const http = require('http');
const {URL} = require('url');

const OpenIDConnectHelper = require('./OpenIDConnectHelper.js');

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
                // console.log("%s:config %j", prefix, this.configuration);
                // console.log("%s:accessToken %j", prefix, accessToken);

                let credentials = Buffer.from(this.configuration.client.client_id + ':' + this.configuration.client.client_secret).toString('base64');
                let auth = 'Basic ' + credentials;
                let introspectionURL = new URL(this.configuration.oidcserver.introspection_endpoint);
                introspectionURL.searchParams.append('token_type_hint', 'requesting_party_token');
                introspectionURL.searchParams.append('token', accessToken);
                // console.log('%s: introspectionURL ', prefix, introspectionURL);

                let jsonObject = introspectionURL.search.replace('?', '');
                // console.log("%s:jsonObject %j", prefix, jsonObject);

                const options = {
                    host: introspectionURL.hostname,
                    port: introspectionURL.port,
                    path: introspectionURL.pathname,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(jsonObject),
                        'Accept': 'application/json',
                        'Authorization': auth
                    },
                    rejectUnauthorized: false
                };
                // console.log('%s:options ', prefix, options);

                let HTTPClient = undefined;
                switch (introspectionURL.protocol) {
                    case 'http':
                        HTTPClient = http;
                        break;
                    case 'https':
                        HTTPClient = https;
                        break;
                    default:
                        HTTPClient = http;
                        break;
                }
                let callReturn = "";
                const request = HTTPClient.request(options, (response) => {
                    response.setEncoding('utf8');
                    response.on('end', () => {
                        // console.log('%s:callReturn ', prefix, callReturn);
                        let result = JSON.parse(callReturn);
                        this.getAccessTokenContent(accessToken)
                            .then(decodedAccessToken => {
                                // console.log('%s:decodedAccessToken %j', prefix, decodedAccessToken);
                                result.accessToken = decodedAccessToken;
                                resolve(result);
                            })
                            .catch(error => {
                                reject(error);
                                console.log('%s:error %j', prefix, error);
                            });
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
                request.write(jsonObject);
                request.end();
            } catch (exception) {
                console.log('%s:exception %j', prefix, exception.stack);
                reject(exception);
            }
        });
    }

    getAccessTokenContent(accessToken) {
        let prefix = globalPrefix + ":introspection";
        return new Promise((resolve, reject) => {
            try {
                let openIDConnectHelper = new OpenIDConnectHelper(this.configuration);
                openIDConnectHelper.getJWTContent(accessToken)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(error => {
                        console.log('%s:error %j', prefix, error);
                        reject(error);
                    })

            } catch (exception) {
                console.log('%s:exception %j', prefix, exception.stack);
                reject(exception);
            }
        })
    }
}

module.exports = OpenIDConnectHTTPClient;