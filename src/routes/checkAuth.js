const jwt = require('jsonwebtoken');

const Log4n = require('../utils/log4n.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/checkauth');
    let token = req.get('authorization').replace('Bearer ', '');
    // log4n.object(token, 'token');

    let parsedToken = jwt.decode(token);
    // log4n.object(parsedToken, 'parsedToken');

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

    if (parsedToken.client.roles.length > 0) {
        parsedToken.client.roles.forEach(role => {
            switch (role) {
                case 'user':
                    userInfo.active = true;
                    break;

                case 'admin':
                    userInfo.admin = true;
                    break;
                default:
                    break;
            }
        })
    }

    log4n.object(userInfo, 'userInfo');

    if (userInfo.active) {
        return userInfo;
    } else {
        log4n.error('inactive user');
        throw new Error('403');
    }
};