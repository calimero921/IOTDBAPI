const https = require('https');
const http = require('http');
const {URL} = require('url');

const OpenIDConnectHelper = require('./OpenIDConnectHelper.js');

const globalPrefix = 'OpenIDConnectHTTPClient';

class OpenIDConnectHTTPClient {
    constructor(configuration) {
        let prefix = globalPrefix + ":constructor";
        this.configuration = configuration;
        this.openIDConnectHelper = new OpenIDConnectHelper(this.configuration);
    }

    introspection(accessToken) {
        let prefix = globalPrefix + ":introspection";
        return new Promise((resolve, reject) => {
            try {
                // console.log("%s:config %j", prefix, this.configuration);
                // console.log("%s:encodedAccessToken %j", prefix, encodedAccessToken);

                let credentials = Buffer.from(this.configuration.client.client_id + ':' + this.configuration.client.client_secret).toString('base64');
                let auth = 'Basic ' + credentials;
                let introspectionURL = new URL(this.configuration.oidcserver.introspection_endpoint);
                introspectionURL.searchParams.append('token_type_hint', 'requesting_party_token');
                introspectionURL.searchParams.append('token', accessToken);
                // console.log('%s: introspectionURL ', prefix, introspectionURL);

                let jsonObject = introspectionURL.search.replace('?', '');
                // console.log("%s:jsonObject %j", prefix, jsonObject);

                let result = {};
                genericHTTPRequest('POST', introspectionURL, auth, jsonObject)
                    .then(authorization => {
                        result.authorization = authorization;
                        // console.log('%s:authorization ', prefix, result.authorization);
                        return this.openIDConnectHelper.getAccessTokenContent(accessToken);
                    })
                    .then(decodedAccessToken => {
                        // console.log('%s:decodedAccessToken %j', prefix, decodedAccessToken);
                        result.accesstoken = decodedAccessToken;
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
        let prefix = globalPrefix + ":userInfo";
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
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorization': auth
                },
                rejectUnauthorized: false
            };
            // console.log('%s:options ', prefix, options);
            if (typeof body !== 'undefined') {
                options.headers["Content-Length"] = Buffer.byteLength(body);
            }

            let HTTPClient = undefined;
            switch (url.protocol) {
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