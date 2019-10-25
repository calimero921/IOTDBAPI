const {JWKS} = require('jose');
const {JWS} = require('jose');
const {JWT} = require('jose');

const OpenIDConnectHTTPClient = require('./OpenIDConnectHTTPClient.js');

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
            let openIDConnectHTTPClient = new OpenIDConnectHTTPClient(context.configuration);
            // console.log('%s: context ', prefix, context);
            if (context.keyStore.length > 0) {
                resolve(context.keyStore);
                console.log('%s:reuse keyStore ', prefix, context.keyStore);
            } else {
                openIDConnectHTTPClient.jwksuri()
                    .then(jwks => {
                        let keyStore = JWKS.asKeyStore(jwks);
                        resolve(keyStore);
                        // console.log('%s:new keyStore ', prefix, keyStore);
                    })
                    .catch(error => {
                        reject(error);
                        console.log('%s:error %j', prefix, error);
                    });
            }
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
            reject(exception);
        }
    });
}

module.exports = OpenIDConnectHelper;