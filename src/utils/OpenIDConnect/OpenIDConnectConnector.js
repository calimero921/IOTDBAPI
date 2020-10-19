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

const OpenIDConnectConfig = require('./OpenIDConnectConfig.js');
const OpenIDConnectHTTPClient = require('./OpenIDConnectHTTPClient.js');
const OpenIDConnectHelper = require('./OpenIDConnectHelper.js');

const globalPrefix = 'OpenIDConnectConnect';

let openIDConnectConfig = undefined;
let openIDConnectHTTPClient = undefined;
let openIDConnectHelper = undefined;

class OpenIDConnectConnect {
    constructor() {
        let prefix = globalPrefix + ":constructor";
        try {
            openIDConnectConfig = new OpenIDConnectConfig();
            openIDConnectConfig.getConfig()
                .then(result => {
                    this.configuration = result;
                    // console.log('%s:done', prefix);
                    openIDConnectHTTPClient = new OpenIDConnectHTTPClient(this.configuration);
                    openIDConnectHelper = new OpenIDConnectHelper(this.configuration);
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
            // let openIDConnectHTTPClient = new OpenIDConnectHTTPClient(configuration);
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
                        .then(authorization => {
                            // console.log('%s:authorization: ', prefix, authorization);
                            if (typeof authorization === 'undefined') {
                                console.log('%s:no introspection data', prefix);
                                return;
                            } else {
                                context.authorization = authorization;
                                // console.log('%s:context: ',prefix, context);
                                return openIDConnectHelper.getAccessTokenContent(context.encodedAccessToken);
                            }
                        })
                        .then(accesstoken => {
                            // console.log('%s:accesstoken: ', prefix, accesstoken);
                            if (typeof accesstoken === 'undefined') {
                                console.log('%s:no access token data', prefix);
                                return;
                            } else {
                                context.accessToken = accesstoken;
                                // console.log('%s:context: ',prefix, context);
                                return openIDConnectHTTPClient.userinfo(bearer);
                            }
                        })
                        .then(userinfo => {
                            // console.log('%s:introspection: ', prefix, result);
                            if (typeof userinfo === 'undefined') {
                                console.log('%s:no user info data', prefix);
                                response.status(500).send();
                            } else {
                                context.userinfo = userinfo;
                                // console.log('%s:context: ', prefix, context);
                                if (context.authorization.active) {
                                    request.openIDConnect = context;
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