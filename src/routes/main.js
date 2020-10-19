const checkAuth = require('../utils/checkAuth.js')
const configuration = require('../config/Configuration.js');
const serverLogger = require('../utils/ServerLogger.js');

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
    let context = {
        httpRequestId: 'initialize',
        authorizedClient: 'internal'
    }
    const logger = serverLogger.child({
        source: '/routes/main.js',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.info('Router starting ...');
    logger.info('Request ID middleware');
    server.use((request, response, next) => {
        request.httpRequestId = Date.now().toString();
        next();
    });

    server.get('/status', checkAuth, status);

    server.get('/' + configuration.server.api_version + '/account', checkAuth, accountGet);
    server.get('/' + configuration.server.api_version + '/account/id/:id', checkAuth, accountGetByID);
    server.get('/' + configuration.server.api_version + '/account/email/:email', checkAuth, accountGetByEmail);
    server.get('/' + configuration.server.api_version + '/account/session/:session_id', checkAuth, accountGetBySession);
    server.post('/' + configuration.server.api_version + '/account', accountPost);
    server.patch('/' + configuration.server.api_version + '/account/:id/:token', checkAuth, accountPatch);
    server.delete('/' + configuration.server.api_version + '/account/:id/:token', checkAuth, accountDelete);

    server.get('/' + configuration.server.api_version + '/device/:id', checkAuth, deviceGetById);
    server.get('/' + configuration.server.api_version + '/device/user/:id', checkAuth, deviceGetByUser);
    server.get('/' + configuration.server.api_version + '/device/exists/:manufacturer/:model/:serial/:secret', checkAuth, deviceExists);
    server.post('/' + configuration.server.api_version + '/device', checkAuth, devicePost);
    server.patch('/' + configuration.server.api_version + '/device/:id', checkAuth, devicePatch);
    server.delete('/' + configuration.server.api_version + '/device/:id', checkAuth, deviceDelete);

    server.get('/' + configuration.server.api_version + '/event/:id', measureGetById);
    server.post('/' + configuration.server.api_version + '/event', measurePost);
    server.delete('/' + configuration.server.api_version + '/event/:id', measureDelete);

    logger.debug('done');
};
