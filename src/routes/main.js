const auth = require('basic-auth');

const Log4n = require('../utils/log4n.js');
const server = require('../config/server.js');
const responseError = require('../utils/responseError.js');
const errorParsing = require('../utils/errorparsing.js');
const accountGetModels = require('../models/api/account/get.js');

const accountPost = require('./api/account/post.js');
const accountPatch = require('./api/account/patch.js');
const accountGetByEmail = require('./api/account/getByEmail.js');
const accountGet = require('./api/account/get.js');
const accountCheck = require('./api/account/check');
const accountSetPassword = require('./api/account/setPassword');
//const accountDelete = require('./api/account/delete.js');
//const accountRecover = require('./api/account/recover');
//const accountGetBySession = require('../models/api/account/getBySession.js');

//const devicePost = require('./api/device/post.js');
//const deviceGet = require('./api/device/get.js');
//const deviceDelete = require('./api/device/delete.js');
//const devicePatch = require('./api/device/patch.js');

module.exports = function (app) {
    const log4n = new Log4n('/routes/main');

    app.get('/status', (req, res) => {res.status(200).send({'swagger_version':server.swagger, 'last_update':server.date})});

    app.post('/v1/account', (req, res) => {accountPost(req, res)});
    app.get('/v1/account/email/:email', checkAuth, (req, res) => {accountGetByEmail(req, res)});
    app.patch('/v1/account/:id', checkAuth, (req, res) => {accountPatch(req, res)});
    app.get('/v1/account/id/:id', checkAuth, (req, res) => {accountGet(req, res)});
    app.get('/v1/account/check/:login/:password/:session', (req, res) => {accountCheck(req, res)});
    app.post('/v1/account/password', (req, res) => {accountSetPassword(req, res);});
    //app.delete('/v1/account/:id', checkAuth, (req, res) => {accountDelete(req, res)});

    //app.post('/v1/device', checkAuth, (req, res) => {devicePost(req, res)});
    //app.get('/v1/device/:device_id', checkAuth, (req, res) => {deviceGet(req, res)});
    //app.delete('/v1/device/:device_id', checkAuth, (req, res) => {deviceDelete(req, res)});
    //app.patch('/v1/device/:device_id', checkAuth, (req, res) => {devicePatch(req, res)});

    log4n.debug('done');
};

function checkAuth(req, res, next) {
    const log4n = new Log4n('/routes/main/checkauth');
    let credentials = auth(req);
    log4n.object(credentials, 'credentials');

    if (typeof credentials === 'undefined') {
        log4n.info('error no credentials found');
        responseError(errorParsing({error_code: 401}), res, log4n);
    } else {
        accountGetModels({'login': credentials.name, 'password': credentials.pass}, 0, 0)
            .then(result => {
                // log4n.object(result, 'result');
                if(result.length > 0) {
                    log4n.debug('check Ok');
                    next();
                } else {
                    responseError(errorParsing({error_code: 403}), res, log4n);
                }
            })
            .catch(err => {
                responseError(errorParsing({error_code: 403}), res, log4n);
            });
    }
}