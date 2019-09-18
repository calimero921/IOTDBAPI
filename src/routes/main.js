const server = require('../config/server.js');

const Log4n = require('../utils/log4n.js');

const statusGet = require('./status.js');

const accountGet = require('./api/account/get.js');
const accountGetByID = require('./api/account/getByID.js');
const accountGetByEmail = require('./api/account/getByEmail.js');
const accountGetBySession = require('../routes/api/account/getBySession.js');
const accountPost = require('./api/account/post.js');
const accountPatch = require('./api/account/patch.js');
const accountDelete = require('./api/account/delete.js');

const deviceGetByUser = require('./api/device/getByUser.js');
const deviceGet = require('./api/device/get.js');
const deviceExists = require('./api/device/exists.js');
const devicePost = require('./api/device/post.js');
const devicePatch = require('./api/device/patch.js');
const deviceDelete = require('./api/device/delete.js');

module.exports = function (app, keycloak) {
    const log4n = new Log4n('/routes/main');

    app.get('/status', statusGet);

    app.get('/1.0.0/account', keycloak.protect(), accountGet);
    app.get('/1.0.0/account/id/:id', keycloak.protect(), accountGetByID);
    app.get('/1.0.0/account/email/:email', keycloak.protect(), accountGetByEmail);
    app.get('/1.0.0/account/session/:session_id', keycloak.protect(), accountGetBySession);
    app.post('/1.0.0/account', accountPost);
    app.patch('/1.0.0/account/:id/:token', keycloak.protect(), accountPatch);
    app.delete('/1.0.0/account/:id/:token', keycloak.protect(), accountDelete);

    app.get('/1.0.0/device/user/:id', keycloak.protect(), deviceGetByUser);
    app.get('/1.0.0/device/:id', keycloak.protect(), deviceGet);
    app.get('/1.0.0/device/exists/:manufacturer/:model/:serial/:secret', keycloak.protect(), deviceExists);
    app.post('/1.0.0/device', keycloak.protect(), devicePost);
    app.patch('/1.0.0/device/:id', keycloak.protect(), devicePatch);
    app.delete('/1.0.0/device/:id', keycloak.protect(), deviceDelete);

    /**
     * @typedef Account
     * @property {string} id
     * @property {string} firstname.required - User firstname
     * @property {string} lastname.required - User lastname
     * @property {string} email.required - User email
     * @property {string} session_id - User last session id
     * @property {boolean} admin.required - User is an admin
     * @property {boolean} active.required - User is active
     * @property {number} creation_date.required - User creation date timestamp
     * @property {number} current_connexion_date - User current connection date timestamp
     * @property {number} last_connexion_date - User last connection date timestamp
     * @property {string} token - User token to validate next action
     */

    /**
     * @typedef Device
     * @property {string} id
     * @property {string} key.required - Device security key
     * @property {string} user_id.required - Device owner id
     * @property {string} manufacturer.required - Device manufacturer
     * @property {string} model.required - Device model
     * @property {string} serial.required - Device serial number
     * @property {string} secret.required - Device manufacturer secret key
     * @property {string} name.required - Device name
     * @property {number} creation_date.required - Device creation date timestamp
     * @property {string} class.required - Device class
     * @property {string} local_ip - Device local IP address
     * @property {number} last_connexion_date - Device last connection date timestamp
     * @property {array.<Capability>} capabilities - List of Device capabilities
     */

    /**
     * @typedef Capability
     * @property {string} name.required - Capability name
     * @property {string} type.required - Capability type
     * @property {string} last_value.required - Capability last value
     * @property {string} publish.required - Capability MQTT publish topic
     * @property {string} subscribe - Capability MQTT subscribe topic
     */

    log4n.debug('done');
};

function displayToken(token, request) {
    const log4n = new Log4n('/routes/main/displayToken');
    try {
        token.clientId =
        log4n.object(token.clientId, 'token.clientId');
        log4n.object(token.header, 'token.header');
        log4n.object(token.content, 'token.content');
    } catch (exception) {
        log4n.error(exception.stack);
    }
    return true;
}