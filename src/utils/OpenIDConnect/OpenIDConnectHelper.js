const https = require('https');
const http = require('http');
const { JWKS } = require('jose');
const { JWS } = require('jose');
const { JWT } = require('jose');

const globalPrefix = 'OpenIDConnectHelper';

class OpenIDConnectHelper {
    constructor(configuration) {
        let prefix = globalPrefix + ":constructor";
        try {
            this.context = {};
            this.context.configuration = configuration;
            this.context.keyStore = {};
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
        }
    }

    getAccessTokenContent(jwtObject) {
        let prefix = globalPrefix + ":getAccessTokenContent";
        return new Promise((resolve, reject) => {
            try {
                // console.log('%s:jwtObject %j', prefix, jwtObject);
                let decodedJWT = JWT.decode(jwtObject, {complete: true});
                // console.log('%s:decodedJWT.header %j', prefix, decodedJWT.header);
                // console.log('%s:decodedJWT.payload %j', prefix, decodedJWT.payload);
                // console.log('%s:decodedJWT.signature %j', prefix, decodedJWT.signature);

                getJWKS(this.context)
                    .then(keyStore => {
                        // console.log('%s:keyStore %j', prefix, keyStore);
                        this.context.keyStore = keyStore;
                        return isJWTValid(this.context.keyStore, jwtObject, decodedJWT.header.kid);
                    })
                    .then(() => {
                        resolve(decodedJWT.payload);
                    })
                    .catch(error => {
                        reject(error);
                        console.log('%s:error %s', prefix, error);
                    })
            } catch (exception) {
                resolve(exception);
                console.log('%s:exception ', prefix, exception.stack);
            }
        });
    }
}

function isJWTValid(keyStore, jwtObject, kid) {
    let prefix = globalPrefix + ":isJWTvalid";
    return new Promise((resolve, reject) => {
        try {
            getKey(keyStore, kid)
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

function getJWKS(context) {
    let prefix = globalPrefix + ":getJWKS";
    return new Promise((resolve, reject) => {
        try {
            // console.log('%s: context ', prefix, context);
            if (context.keyStore.length > 0) {
                resolve(context.keyStore);
                console.log('%s:reuse keyStore ', prefix, context.keyStore);
            } else {
                let JWKSURL = new URL(context.configuration.oidcserver.jwks_uri);
                // console.log('%s: JWKSURL ', prefix, JWKSURL);

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
                        let keyStore = JWKS.asKeyStore(JSON.parse(callReturn));
                        // console.log('%s:new keyStore ', prefix, keyStore);
                        resolve(keyStore);
                    });
                    response.on('data', (chunk) => {
                        // console.log('%s:chunk ', prefix, chunk);
                        if (typeof chunk === 'undefined') throw('chunk empty');
                        if (typeof callReturn === 'undefined') callReturn = "";
                        callReturn = callReturn + chunk;
                        // console.log('%s:callReturn ', prefix, callReturn);
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