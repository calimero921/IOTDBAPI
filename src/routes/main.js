const Log4n = require('../utils/log4n.js');
const lemonLDAPConnect = require('../utils/OpenIDConnect/OpenIDConnectConnector.js');

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

const measureGetById = require('./api/event/getById.js');
const measurePost = require('./api/event/post.js');
const measureDelete = require('./api/event/delete.js');

let context = {httpRequestId: 'Initialize'};

module.exports = function (app) {
    const log4n = new Log4n(context, '/routes/main.js', 'initialize');
    let lemonLDAP = new lemonLDAPConnect();

    app.use((req, res, next) => {
        req.httpRequestId = Date.now().toString();
        next();
    });

    app.get('/status', status);

    app.get('/1.0.0/account', lemonLDAP.protect, accountGet);
    app.get('/1.0.0/account/id/:id', lemonLDAP.protect, accountGetByID);
    app.get('/1.0.0/account/email/:email', lemonLDAP.protect, accountGetByEmail);
    app.get('/1.0.0/account/session/:session_id', lemonLDAP.protect, accountGetBySession);
    app.post('/1.0.0/account', accountPost);
    app.patch('/1.0.0/account/:id/:token', lemonLDAP.protect, accountPatch);
    app.delete('/1.0.0/account/:id/:token', lemonLDAP.protect, accountDelete);

    app.get('/1.0.0/device/:id', lemonLDAP.protect, deviceGetById);
    app.get('/1.0.0/device/user/:id', lemonLDAP.protect, deviceGetByUser);
    app.get('/1.0.0/device/exists/:manufacturer/:model/:serial/:secret', lemonLDAP.protect, deviceExists);
    app.post('/1.0.0/device', lemonLDAP.protect, devicePost);
    app.patch('/1.0.0/device/:id', lemonLDAP.protect, devicePatch);
    app.delete('/1.0.0/device/:id', lemonLDAP.protect, deviceDelete);

    app.get('/1.0.0/event/:id', lemonLDAP.protect, measureGetById);
    app.post('/1.0.0/event', lemonLDAP.protect, measurePost);
    app.delete('/1.0.0/event/:id', lemonLDAP.protect, measureDelete);

    log4n.debug('done');
};
