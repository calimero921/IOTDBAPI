const https = require('https');
const http = require('http');
const {JWKS} = require('jose');
const {JWS} = require('jose');
const {JWT} = require('jose');

const globalPrefix = 'OpenIDConnectHelper';

class OpenIDConnectHelper {
    constructor(configuration) {
        let prefix = globalPrefix + ":constructor";
        try {
            this.configuration = configuration;
            this.keyStore = [];
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
        }
    }

    getJWTContent(jwtObject) {
        let prefix = globalPrefix + ":getJWTContent";
        return new Promise((resolve, reject) => {
            try {
                // console.log('%s:jwtObject %j', prefix, jwtObject);
                let result = JWT.decode(jwtObject, {complete: true});
                // console.log('%s:result.header %j', prefix, result.header);
                // console.log('%s:result.payload %j', prefix, result.payload);
                // console.log('%s:result.signature %j', prefix, result.signature);

                this.isJWTValid(jwtObject, result.header.kid)
                    .then(() => {
                        resolve(result.payload);
                    })
                    .catch(error => {
                        reject('jwt validation failed: ' + error);
                    })
            } catch (exception) {
                console.log('%s:exception ', prefix, exception.stack);
                resolve(exception);
            }
        });
    }

    isJWTValid(jwtObject, kid) {
        let prefix = globalPrefix + ":isJWTvalid";
        return new Promise((resolve, reject) => {
            try {
                getJWKS(this.configuration, this.keyStore)
                    .then(keyStore => {
                        // console.log('%s:keyStore %j', prefix, keyStore);
                        this.keyStore = keyStore;
                        return getKey(this.keyStore, kid)
                    })
                    .then(key => {
                        // console.log('%s:key %j', prefix, key);
                        let options = {};
                        return JWS.verify(jwtObject, key, options);
                    })
                    .then(result => {
                        // console.log('%s:verify %j', prefix, result);
                        if (typeof result === 'undefined') {
                            reject('unknown key to verify signature');
                        } else {
                            resolve();
                        }
                    })
                    .catch(error => {
                        reject(error);
                    })
            } catch (exception) {
                reject(exception);
                console.log('%s:exception ', prefix, exception.stack);
            }
        })
    }
}

function getKey(keyStore, kid) {
    let prefix = globalPrefix + ":getKey";
    return new Promise((resolve, reject) => {
        try {
            // console.log('%s:keyStore %j', prefix, keyStore);
            // console.log('%s:kid %j', prefix, kid);

            let key = keyStore.get({kid: kid});
            // console.log('%s:key %j', prefix, key);
            if (typeof key === 'undefined') {
                let error = 'key was not found';
                reject(error);
                console.log('%s:error: %s', prefix, error);
            } else {
                resolve(key);
                // console.log('%s:done', prefix);
            }
        } catch (exception) {
            reject(exception);
            console.log('%s:exception ', prefix, exception.stack);
        }
    });
}

function getJWKS(configuration, keyStore) {
    let prefix = globalPrefix + ":getJWKS";
    return new Promise((resolve, reject) => {
        try {
            if (keyStore.length > 0) {
                resolve(keyStore);
            } else {
                let JWKSURL = new URL(configuration.oidcserver.jwks_uri);
                // console.log('%s: introspectionURL ', prefix, introspectionURL);

                const options = {
                    host: JWKSURL.hostname,
                    port: JWKSURL.port,
                    path: JWKSURL.pathname,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                    rejectUnauthorized: false
                };
                // console.log('%s:options ', prefix, options);

                let HTTPClient = undefined;
                switch (JWKSURL.protocol) {
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
                const request = HTTPClient.get(options, (response) => {
                    response.setEncoding('utf8');
                    response.on('end', () => {
                        // console.log('%s:callReturn ', prefix, callReturn);
                        resolve(JWKS.asKeyStore(JSON.parse(callReturn)));
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
            }
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
            reject(exception);
        }
    });
}

module.exports = OpenIDConnectHelper;