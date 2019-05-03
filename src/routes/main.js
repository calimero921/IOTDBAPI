const server = require('../config/server.js');

const Log4n = require('../utils/log4n.js');

const accountGet = require('./api/account/get.js');
const accountGetByID = require('./api/account/getByID.js');
const accountGetByEmail = require('./api/account/getByEmail.js');
const accountGetBySession = require('../routes/api/account/getBySession.js');
const accountPost = require('./api/account/post.js');
const accountPatch = require('./api/account/patch.js');
const accountDelete = require('./api/account/delete.js');

const deviceGet = require('./api/device/get.js');
const deviceExists = require('./api/device/exists.js');
const devicePost = require('./api/device/post.js');
const devicePatch = require('./api/device/patch.js');
const deviceDelete = require('./api/device/delete.js');

module.exports = function (app, keycloak) {
    const log4n = new Log4n('/routes/main');

    app.get('/status', (req, res) => {res.status(200).send({'swagger_version':server.swagger, 'last_update':server.date})});

    app.get('/1.0.0/account', keycloak.protect(), accountGet);
    app.get('/1.0.0/account/id/:id', keycloak.protect(), accountGetByID);
    app.get('/1.0.0/account/email/:email', keycloak.protect(), accountGetByEmail);
    app.get('/1.0.0/account/session/:session_id', keycloak.protect(), accountGetBySession);
    app.post('/1.0.0/account', accountPost);
    app.patch('/1.0.0/account/:id/:token', keycloak.protect(), accountPatch);
    app.delete('/1.0.0/account/:id/:token', keycloak.protect(), accountDelete);

    app.get('/1.0.0/device/:id', keycloak.protect(), deviceGet);
    app.get('/1.0.0/device/exists/:manufacturer/:model/:serial/:secret', keycloak.protect(), deviceExists);
    app.post('/1.0.0/device', keycloak.protect(), devicePost);
    app.patch('/1.0.0/device/:id', keycloak.protect(), devicePatch);
    app.delete('/1.0.0/device/:id', keycloak.protect(), deviceDelete);

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