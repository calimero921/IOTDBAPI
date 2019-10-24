const OpenIDConnectConfig = require('./OpenIDConnectConfig.js');
const OpenIDConnectHTTPClient = require('./OpenIDConnectHTTPClient.js');

const globalPrefix = 'OpenIDConnectConnect';

let openIDConnectConfig = undefined;
let openIDConnectHTTPClient = undefined;

class OpenIDConnectConnect {
    constructor() {
        let prefix = globalPrefix + ":constructor";
        try {
            openIDConnectConfig = new OpenIDConnectConfig();
            openIDConnectConfig.getConfig()
                .then(result => {
                    this.config = result;
                    // console.log('%s:done', prefix);
                    openIDConnectHTTPClient = new OpenIDConnectHTTPClient(this.config);
                })
                .catch(error => {
                    console.log('%s:error: %j', prefix, error);
                });
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
        }
    }

    protect(request, response, next) {
        let prefix = globalPrefix + ":protect";
        try {
            // let openIDConnectHTTPClient = new OpenIDConnectHTTPClient(config);
            let bearer = request.headers['authorization'];
            // console.log('%s:authorization: %s',prefix, authorization);
            if (typeof bearer === 'undefined') {
                console.log('%s:no authorization provided', prefix);
                return {};
            } else {
                if (bearer.startsWith('Bearer ')) {
                    let context = {};
                    context.encodedAccessToken = bearer.substr(7);
                    openIDConnectHTTPClient.introspection(context.encodedAccessToken)
                        .then(result => {
                            // console.log('%s:introspection: ', prefix, result);
                            if (typeof result === 'undefined') {
                                console.log('%s:no introspection data', prefix);
                                return;
                            } else {
                                context.authorization = result.authorization;
                                context.accessToken = result.accesstoken;
                                // console.log('%s:context: ',prefix, context);
                                return openIDConnectHTTPClient.userinfo(bearer);
                            }
                        })
                        .then(userinfo => {
                            // console.log('%s:introspection: ', prefix, result);
                            if (typeof userinfo === 'undefined') {
                                console.log('%s:no introspection data', prefix);
                                response.status(500).send();
                            } else {
                                if (context.authorization.active) {
                                    context.userinfo = userinfo;
                                    // console.log('%s:context: ',prefix, context);
                                    request.access_token = context;
                                    next();
                                } else {
                                    console.log('%s:forbidden', prefix);
                                    response.status(403).send();
                                }
                            }
                        })
                        .catch(error => {
                            console.log('%s:error: %j', prefix, error);
                            response.status(500).send();
                        });
                } else {
                    console.log('%s:no bearer information', prefix);
                    return {};
                }
            }
        } catch (exception) {
            console.log('%s:exception ', prefix, exception.stack);
            response.status(500).send();
        }
    }
}

module.exports = OpenIDConnectConnect;