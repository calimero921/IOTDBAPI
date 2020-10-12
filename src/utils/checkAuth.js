const {JWT} = require('jose');

const serverLogger = require('../utils/serverLogger.js');
const errorParsing = require('../utils/errorParsing.js');

module.exports = function (context, request, response) {
    const logger = serverLogger.child({
        source: '/utils/checkauth.js',
        httpRequestId: context.httpRequestId
    });

    try {
        // let accessToken = request.openIDConnect.accessToken;
        let accessToken = getTestAccessToken();
        logger.debug('accessToken: %j', accessToken);

        // let userInfo = request.openIDConnect.userinfo;
        let userInfo = getTestUserInfo();
        logger.debug('userInfo: %j', userInfo);

        if (userInfo) {
            let resultUserInfo = {
                id: userInfo.sub,
                firstname: userInfo.given_name,
                lastname: userInfo.family_name,
                email: userInfo.email,
                admin: false,
                active: false
            };

            let client = accessToken.azp;
            logger.debug('client: %j', client);

            //lecture des roles liés au royaume
            if (accessToken.realm_access) {
                logger.debug('realm_access: %j', accessToken.realm_access);
                if (accessToken.realm_access.roles.length > 0) {
                    accessToken.realm_access.roles.forEach(role => {
                        switch (role) {
                            case 'users':
                                resultUserInfo.active = true;
                                break;
                            case 'admins':
                                resultUserInfo.admin = true;
                                break;
                            default:
                                break;
                        }
                    })
                }
            }

            //lecture des roles liés à l'application
            if (accessToken.resource_access) {
                logger.debug('resource_access: %j', accessToken.resource_access);
                if (accessToken.resource_access[client].roles.length > 0) {
                    accessToken.resource_access[client].roles.forEach(role => {
                        switch (role) {
                            case 'users':
                                resultUserInfo.active = true;
                                break;
                            case 'admins':
                                resultUserInfo.admin = true;
                                break;
                            default:
                                break;
                        }
                    })
                }
            }
            logger.debug('userInfo: %j', resultUserInfo);

            if (resultUserInfo.active) {
                logger.debug('done - ok');
                return resultUserInfo;
            } else {
                logger.error('done - Unauthorized user');
                throw new Error('403');
            }
        }
    } catch (exception) {
        logger.error(exception.stack);
        throw new Error('500')
    }
};

function getTestAccessToken() {
    return {
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
            // roles: ["users"]
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
}

function getTestUserInfo() {
    return {
        sub: '23df8bad-ca36-4dba-90e0-1a69f0f016b8',
        given_name: 'Emmanuel',
        family_name: 'David',
        email: 'emmanuel.davic@orange.com',
    };
}