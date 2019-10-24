const {JWT} = require('jose');
const Log4n = require('./log4n.js');

module.exports = function (context, req, res) {
    const log4n = new Log4n(context, '/routes/checkauth.js');

    let parsedToken = req.access_token.accessToken;
    // log4n.object(parsedToken, 'parsedToken');
    let parsedUserInfo = req.access_token.userinfo;
    // log4n.object(parsedUserInfo, 'parsedUserInfo');

    if(typeof parsedUserInfo !== 'undefined') {
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
        // log4n.object(client, 'client');

        //lecture des roles liés au royaume
        if(typeof parsedToken.realm_access !== 'undefined') {
            // log4n.object(parsedToken.realm_access, 'parsedToken.realm_access');
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
        if(typeof parsedToken.resource_access !== 'undefined') {
            // log4n.object(parsedToken.resource_access, 'parsedToken.resource_access');
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
        log4n.object(userInfo, 'userInfo');

        if (userInfo.active) {
            log4n.debug('done - ok');
            return userInfo;
        } else {
            log4n.error('done - Unauthorized user');
            throw new Error('403');
        }
    }
};