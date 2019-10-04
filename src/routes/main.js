const Log4n = require('../utils/log4n.js');

const status = require('./status.js');

const accountGet = require('./api/account/getAll.js');
const accountGetByID = require('./api/account/getByID.js');
const accountGetByEmail = require('./api/account/getByEmail.js');
const accountGetBySession = require('./api/account/getBySession.js');
const accountPost = require('./api/account/post.js');
const accountPatch = require('./api/account/patch.js');
const accountDelete = require('./api/account/delete.js');

const deviceGetById = require('./api/device/getById.js');
const deviceGetByUser = require('./api/device/getByUser.js');
const deviceExists = require('./api/device/exists.js');
const devicePost = require('./api/device/post.js');
const devicePatch = require('./api/device/patch.js');
const deviceDelete = require('./api/device/delete.js');

const measureGetById = require('./api/measure/getById.js');
const measurePost = require('./api/measure/post.js');
const measureDelete = require('./api/measure/delete.js');

let context = {httpRequestId: 'Initialize'};

module.exports = function (app, keycloak) {
    const log4n = new Log4n(context, '/routes/main.js', 'initialize');
    app.use((req, res, next) => {
        req.httpRequestId = Date.now().toString();
        next();
    });

    app.get('/status', status);

    app.get('/1.0.0/account', keycloak.protect(), accountGet);
    app.get('/1.0.0/account/id/:id', keycloak.protect(), accountGetByID);
    app.get('/1.0.0/account/email/:email', keycloak.protect(), accountGetByEmail);
    app.get('/1.0.0/account/session/:session_id', keycloak.protect(), accountGetBySession);
    app.post('/1.0.0/account', accountPost);
    app.patch('/1.0.0/account/:id/:token', keycloak.protect(), accountPatch);
    app.delete('/1.0.0/account/:id/:token', keycloak.protect(), accountDelete);

    app.get('/1.0.0/device/:id', keycloak.protect(), deviceGetById);
    app.get('/1.0.0/device/user/:id', keycloak.protect(), deviceGetByUser);
    app.get('/1.0.0/device/exists/:manufacturer/:model/:serial/:secret', keycloak.protect(), deviceExists);
    app.post('/1.0.0/device', keycloak.protect(), devicePost);
    app.patch('/1.0.0/device/:id', keycloak.protect(), devicePatch);
    app.delete('/1.0.0/device/:id', keycloak.protect(), deviceDelete);

    app.get('/1.0.0/measure/:id', keycloak.protect(), measureGetById);
    app.post('/1.0.0/measure', keycloak.protect(), measurePost);
    app.delete('/1.0.0/measure/:id', keycloak.protect(), measureDelete);

    log4n.debug('done');
};

function displayToken(token, request) {
    const log4n = new Log4n(context, '/routes/main/displayToken');
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