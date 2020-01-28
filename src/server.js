/**
 * Module dependencies.
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');

const serverPath = path.join(process.cwd(), 'src');

const configuration = require('./config/Configuration.js');
const serverLogger = require('./utils/ServerLogger.js');

const logger = serverLogger.child({
    source: '/server.js',
    httpRequestId: 'initialize'
});
logger.info('IOTDB API server is starting ...');
logger.debug('configuration: %j', configuration);
logger.debug('serverPath: %s', serverPath);

const session = require('express-session');
let server = express();

logger.info('Express swagger generator setup');
if (configuration.swagger) {
    const expressSwagger = require('express-swagger-generator')(server);
    let swaggerOptions = configuration.swagger;
    expressSwagger(swaggerOptions);
}

// uncomment after placing your favicon in /public
logger.debug('Engine setup');
server.use(express.json());
server.use(express.urlencoded({extended: false}));

logger.debug('Parser setup');
server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: false}));

logger.debug('Express server setup');
server.set('trust proxy', 1);
require('./routes/main.js')(server);

/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || configuration.server.port);
server.set('port', port);

/**
 * Create HTTPS server.
 */
logger.info('HTTPS server setup');
let httpsServer = {};
if ((configuration.server.ca_crt) && (configuration.server.server_key) && (configuration.server.server_crt)) {
    let caKeyPath = path.join(serverPath, configuration.server.ca_crt);
    let privateKeyPath = path.join(serverPath, configuration.server.server_key);
    let certificatePath = path.join(serverPath, configuration.server.server_crt);

    if ((fs.existsSync(privateKeyPath)) && (fs.existsSync(certificatePath))) {
        let httpsOptions = {
            ca: fs.readFileSync(caKeyPath),
            key: fs.readFileSync(privateKeyPath),
            cert: fs.readFileSync(certificatePath)
        };
        httpsServer = https.createServer(httpsOptions, server);

        /**
         * Listen on provided port, on all network interfaces.
         */
        logger.info('HTTPS server starting');
        httpsServer.listen(port);
        httpsServer.on('error', onError);
        httpsServer.on('listening', onListening);
        httpsServer.on('stop', onStop);
        logger.info('HTTPS server started on port %s', port);
    } else {
        logger.error('Connot find security keys, cannot start https server');
        process.exit(91);
    }
} else {
    logger.error('Missing security keys, cannot start https server');
    process.exit(91);
}
module.exports = server;
logger.debug('HTTPS server started on port ' + port);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false
}

/**
 * Event listener for HTTPS server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTPS server "listening" event.
 */
function onListening() {
    let addr = httpsServer.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    logger.debug('Listening on ' + bind)
}

/**
 * Event listener for HTTPS server "stop" event.
 */
function onStop() {
}
