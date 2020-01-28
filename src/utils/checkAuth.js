const {JWT} = require('jose');

const serverLogger = require('../utils/serverLogger.js');

module.exports = function (context, request, response) {
    const logger = serverLogger.child({
        source: '/utils/checkauth.js',
        httpRequestId: context.httpRequestId
    });

    // let parsedToken = request.openIDConnect.accessToken;
    let parsedToken = {
        jti: "a13dc9cc-c06b-4f80-807d-853c0378eb8b",
        exp: 1572044038,
        nbf: 0,
        iat: 1572008045,
        iss: "http://localhost:8080/auth/realms/IOTDB",
        sub: "23df8bad-ca36-4dba-90e0-1a69f0f016b8",
        typ: "Bearer",
        azp: "IOTDBDashboard",
        auth_time: 1572008038,
        session_state: "353e1fe9-9755-4acf-a9a8-e2c3e59588b8",
        acr: "0",
        allowed_origins: ["https://localhost:4443"],
        realm_access: {
            roles: ["users", "admins"]
        }
        ,
        resource_access: {
            IOTDBDashboard: {
                roles: [
                    "uma_protection"
                ]
            }
        }
        ,
        scope: "openid profile read_profile email",
        email_verified: true,
        name: "Emmanuel David",
        preferred_username: "bede6362",
        given_name: "Emmanuel",
        family_name: "David",
        email: "emmanuel.david@orange.com"
    };
    logger.debug('parsedToken: %j', parsedToken);
    // let parsedUserInfo = request.openIDConnect.userinfo;
    let parsedUserInfo = {
        sub: '23df8bad-ca36-4dba-90e0-1a69f0f016b8',
        given_name: 'Emmanuel',
        family_name: 'David',
        email: 'emmanuel.davic@orange.com',
    };
    logger.debug('parsedUserInfo: %j', parsedUserInfo);

    if (typeof parsedUserInfo !== 'undefined') {
        let userInfo = {
            id: parsedUserInfo.sub,
            firstname: parsedUserInfo.given_name,
            lastname: parsedUserInfo.family_name,
            email: "",
            admin: false,
            active: false
        };

        if (parsedUserInfo.email_verified) {
            userInfo.email = parsedUserInfo.email;
        }

        let client = parsedToken.azp;
        logger.debug('client: %j', client);

        //lecture des roles liés au royaume
        if (typeof parsedToken.realm_access !== 'undefined') {
            logger.debug('parsedToken.realm_access: %j', parsedToken.realm_access);
            if (parsedToken.realm_access.roles.length > 0) {
                parsedToken.realm_access.roles.forEach(role => {
                    switch (role) {
                        case 'users':
                            userInfo.active = true;
                            break;
                        case 'admins':
                            userInfo.admin = true;
                            break;
                        default:
                            break;
                    }
                })
            }
        }

        //lecture des roles liés à l'application
        if (typeof parsedToken.resource_access !== 'undefined') {
            logger.debug('parsedToken.resource_access: %j', parsedToken.resource_access);
            if (parsedToken.resource_access[client].roles.length > 0) {
                parsedToken.resource_access[client].roles.forEach(role => {
                    switch (role) {
                        case 'users':
                            userInfo.active = true;
                            break;

                        case 'admins':
                            userInfo.admin = true;
                            break;
                        default:
                            break;
                    }
                })
            }
        }
        logger.debug('userInfo: %j', userInfo);

        if (userInfo.active) {
            logger.debug('done - ok');
            return userInfo;
        } else {
            logger.error('done - Unauthorized user');
            throw new Error('403');
        }
    }
};