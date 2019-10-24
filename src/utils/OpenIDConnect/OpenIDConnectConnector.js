const OpenIDConnectConfig = require('./OpenIDConnectConfig.js');
const OpenIDConnectHTTPClient = require('./OpenIDConnectHTTPClient.js');

const globalPrefix = 'OpenIDConnectConnect';

let openIDConnectConfig = undefined;
let config = undefined;

class OpenIDConnectConnect {
    constructor() {
        let prefix = globalPrefix + ":constructor";
        try {
            openIDConnectConfig = new OpenIDConnectConfig();
            openIDConnectConfig.getConfig()
                .then(result => {
                    config = result;
                    // console.log('%s:done', prefix);
                })
                .catch(error => {
                    response.status(500).send();
                    console.log('%s:error :%j', prefix, error);
                });
        } catch (exception) {
            console.log('%s:exception :%j', prefix, exception.stack);
        }
    }

    // protect(request, response, next) {
    protect(request, response, next) {
        let prefix = globalPrefix + ":protect";
        try {
            let openIDConnectHTTPClient = new OpenIDConnectHTTPClient(config);
            let authorization = request.headers['authorization'];
            // console.log('%s:authorization: %s',prefix, authorization);
            if (typeof authorization === 'undefined') {
                console.log('%s:no authorization provided', prefix);
                return {};
            } else {
                if (authorization.startsWith('Bearer ')) {
                    let accessToken = authorization.substr(7);
                    openIDConnectHTTPClient.introspection(accessToken)
                        .then(result => {
                            // console.log('%s:introspection: ', prefix, result);
                            if (typeof result === 'undefined') {
                                console.log('%s:no introspection data', prefix);
                                response.status(500).send();
                            } else {
                                if (result.active) {
                                    request.access_token = result.accessToken;
                                    next();
                                } else {
                                    console.log('%s:forbidden', prefix);
                                    response.status(403).send();
                                }
                            }
                        })
                        .catch(error => {
                            console.log('%s:error :%j', prefix, error);
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