const jwt = require('jsonwebtoken');

const Log4n = require('./log4n.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/checkauth');
    let token = req.get('authorization').replace('Bearer ', '');
    // log4n.object(token, 'token');

    let parsedToken = jwt.decode(token);
    log4n.object(parsedToken, 'parsedToken');

    let userInfo = {
        id: parsedToken.sub,
        firstname: parsedToken.given_name,
        lastname: parsedToken.family_name,
        email: "",
        admin: false,
        active: false
    };

    if (parsedToken.email_verified) {
        userInfo.email = parsedToken.email;
    }

    let client = parsedToken.azp;
    // log4n.object(client, 'client');

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
    } else {
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
        return userInfo;
    } else {
        log4n.error('inactive user');
        throw new Error('403');
    }
};