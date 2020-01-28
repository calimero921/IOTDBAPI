const config = require('../config/Configuration.js');
const serverLogger = require('../utils/ServerLogger.js');
// const lemonLDAPConnect = require('../utils/OpenIDConnect/OpenIDConnectConnector.js');

const status = require('../controllers/status.js');

const accountGet = require('../controllers/account/getAll.js');
const accountGetByID = require('../controllers/account/getByID.js');
const accountGetByEmail = require('../controllers/account/getByEmail.js');
const accountGetBySession = require('../controllers/account/getBySession.js');
const accountPost = require('../controllers/account/post.js');
const accountPatch = require('../controllers/account/patch.js');
const accountDelete = require('../controllers/account/delete.js');

const deviceGetById = require('../controllers/device/getById.js');
const deviceGetByUser = require('../controllers/device/getByUser.js');
const deviceExists = require('../controllers/device/exists.js');
const devicePost = require('../controllers/device/post.js');
const devicePatch = require('../controllers/device/patch.js');
const deviceDelete = require('../controllers/device/delete.js');

const measureGetById = require('../controllers/event/getById.js');
const measurePost = require('../controllers/event/post.js');
const measureDelete = require('../controllers/event/delete.js');

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

    // server.get('/'+config.server.api_version+'/account', lemonLDAP.protect, accountGet);
    server.get('/' + config.server.api_version + '/account', accountGet);
    // server.get('/'+config.server.api_version+'/account/id/:id', lemonLDAP.protect, accountGetByID);
    server.get('/' + config.server.api_version + '/account/id/:id', accountGetByID);
    // server.get('/'+config.server.api_version+'/account/email/:email', lemonLDAP.protect, accountGetByEmail);
    server.get('/' + config.server.api_version + '/account/email/:email', accountGetByEmail);
    // server.get('/'+config.server.api_version+'/account/session/:session_id', lemonLDAP.protect, accountGetBySession);
    server.get('/' + config.server.api_version + '/account/session/:session_id', accountGetBySession);
    // server.post('/'+config.server.api_version+'/account', accountPost);
    server.post('/' + config.server.api_version + '/account', accountPost);
    // server.patch('/'+config.server.api_version+'/account/:id/:token', lemonLDAP.protect, accountPatch);
    server.patch('/' + config.server.api_version + '/account/:id/:token', accountPatch);
    // server.delete('/'+config.server.api_version+'/account/:id/:token', lemonLDAP.protect, accountDelete);
    server.delete('/' + config.server.api_version + '/account/:id/:token', accountDelete);

    // server.get('/'+config.server.api_version+'/device/:id', lemonLDAP.protect, deviceGetById);
    server.get('/' + config.server.api_version + '/device/:id', deviceGetById);
    // server.get('/'+config.server.api_version+'/device/user/:id', lemonLDAP.protect, deviceGetByUser);
    server.get('/' + config.server.api_version + '/device/user/:id', deviceGetByUser);
    // server.get('/'+config.server.api_version+'/device/exists/:manufacturer/:model/:serial/:secret', lemonLDAP.protect, deviceExists);
    server.get('/' + config.server.api_version + '/device/exists/:manufacturer/:model/:serial/:secret', deviceExists);
    // server.post('/'+config.server.api_version+'/device', lemonLDAP.protect, devicePost);
    server.post('/' + config.server.api_version + '/device', devicePost);
    // server.patch('/'+config.server.api_version+'/device/:id', lemonLDAP.protect, devicePatch);
    server.patch('/' + config.server.api_version + '/device/:id', devicePatch);
    // server.delete('/'+config.server.api_version+'/device/:id', lemonLDAP.protect, deviceDelete);
    server.delete('/' + config.server.api_version + '/device/:id', deviceDelete);

    // server.get('/'+config.server.api_version+'/event/:id', lemonLDAP.protect, measureGetById);
    server.get('/' + config.server.api_version + '/event/:id', measureGetById);
    // server.post('/'+config.server.api_version+'/event', lemonLDAP.protect, measurePost);
    server.post('/' + config.server.api_version + '/event', measurePost);
    // server.delete('/'+config.server.api_version+'/event/:id', lemonLDAP.protect, measureDelete);
    server.delete('/' + config.server.api_version + '/event/:id', measureDelete);

    logger.debug('done');
};
