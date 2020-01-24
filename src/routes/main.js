const config = require('../config/Configuration.js');
const serverLogger = require('../utils/ServerLogger.js');
// const lemonLDAPConnect = require('../utils/OpenIDConnect/OpenIDConnectConnector.js');

const status = require('../controllers/status.js');

const accountGet = require('../controllers/api/account/getAll.js');
const accountGetByID = require('../controllers/api/account/getByID.js');
const accountGetByEmail = require('../controllers/api/account/getByEmail.js');
const accountGetBySession = require('../controllers/api/account/getBySession.js');
const accountPost = require('../controllers/api/account/post.js');
const accountPatch = require('../controllers/api/account/patch.js');
const accountDelete = require('../controllers/api/account/delete.js');

const deviceGetById = require('../controllers/api/device/getById.js');
const deviceGetByUser = require('../controllers/api/device/getByUser.js');
const deviceExists = require('../controllers/api/device/exists.js');
const devicePost = require('../controllers/api/device/post.js');
const devicePatch = require('../controllers/api/device/patch.js');
const deviceDelete = require('../controllers/api/device/delete.js');

const measureGetById = require('../controllers/api/event/getById.js');
const measurePost = require('../controllers/api/event/post.js');
const measureDelete = require('../controllers/api/event/delete.js');

let context = {httpRequestId: 'Initialize'};

module.exports = function (server) {
    const logger = serverLogger.child({
        source: '/routes/main.js',
        httpRequestId: 'initialize'
    });
    // let lemonLDAP = new lemonLDAPConnect();
    logger.info('Router starting ...');
    logger.info('Request ID middleware');
    server.use((request, response, next) => {
        request.httpRequestId = Date.now().toString();
        next();
    });

    server.get('/status', status);

    // server.get('/1.0.0/account', lemonLDAP.protect, accountGet);
    server.get('/1.0.0/account', accountGet);
    // server.get('/1.0.0/account/id/:id', lemonLDAP.protect, accountGetByID);
    server.get('/1.0.0/account/id/:id', accountGetByID);
    // server.get('/1.0.0/account/email/:email', lemonLDAP.protect, accountGetByEmail);
    server.get('/1.0.0/account/email/:email', accountGetByEmail);
    // server.get('/1.0.0/account/session/:session_id', lemonLDAP.protect, accountGetBySession);
    server.get('/1.0.0/account/session/:session_id', accountGetBySession);
    // server.post('/1.0.0/account', accountPost);
    server.post('/1.0.0/account', accountPost);
    // server.patch('/1.0.0/account/:id/:token', lemonLDAP.protect, accountPatch);
    server.patch('/1.0.0/account/:id/:token', accountPatch);
    // server.delete('/1.0.0/account/:id/:token', lemonLDAP.protect, accountDelete);
    server.delete('/1.0.0/account/:id/:token', accountDelete);

    // server.get('/1.0.0/device/:id', lemonLDAP.protect, deviceGetById);
    server.get('/1.0.0/device/:id', deviceGetById);
    // server.get('/1.0.0/device/user/:id', lemonLDAP.protect, deviceGetByUser);
    server.get('/1.0.0/device/user/:id', deviceGetByUser);
    // server.get('/1.0.0/device/exists/:manufacturer/:model/:serial/:secret', lemonLDAP.protect, deviceExists);
    server.get('/1.0.0/device/exists/:manufacturer/:model/:serial/:secret', deviceExists);
    // server.post('/1.0.0/device', lemonLDAP.protect, devicePost);
    server.post('/1.0.0/device', devicePost);
    // server.patch('/1.0.0/device/:id', lemonLDAP.protect, devicePatch);
    server.patch('/1.0.0/device/:id', devicePatch);
    // server.delete('/1.0.0/device/:id', lemonLDAP.protect, deviceDelete);
    server.delete('/1.0.0/device/:id', deviceDelete);

    // server.get('/1.0.0/event/:id', lemonLDAP.protect, measureGetById);
    server.get('/1.0.0/event/:id', measureGetById);
    // server.post('/1.0.0/event', lemonLDAP.protect, measurePost);
    server.post('/1.0.0/event', measurePost);
    // server.delete('/1.0.0/event/:id', lemonLDAP.protect, measureDelete);
    server.delete('/1.0.0/event/:id', measureDelete);

    logger.debug('done');
};
