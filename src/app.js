/**
 * Module dependencies.
 */
const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const config = require('./config/server.js')
const Log4n = require('./utils/log4n.js')

const log4n = new Log4n('/app.js')

log4n.debug('Database connexion setup')
global.mongodbConnexion = null

log4n.debug('Create server')
let app = express()

log4n.debug('Express server setup')
app.set('trust proxy', 1)
require('./routes/main')(app)

// uncomment after placing your favicon in /public
log4n.debug('View engine setup')
app.use(express.static(path.join(__dirname, 'public')))

log4n.debug('Parser setup')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
// app.use(cookieParser());

/**
 * Get port from environment and store in Express.
 */
let port = normalizePort(process.env.PORT || config.port)
app.set('port', port)

/**
 * Create HTTP server.
 */
log4n.debug('HTTP server setup')
let server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */
log4n.debug('HTTP server starting')
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)
server.on('stop', onStop)

module.exports = app
log4n.debug('HTTP server started')

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	let err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}
	
	// render the error page
	res.status(err.status || 500).send()
})

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val) {
	let port = parseInt(val, 10)
	
	if (isNaN(port)) {
		// named pipe
		return val
	}
	
	if (port >= 0) {
		// port number
		return port
	}
	return false
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
	if (error.syscall !== 'listen') {
		throw error
	}
	
	let bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port
	
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges')
			process.exit(1)
			break
		case 'EADDRINUSE':
			console.error(bind + ' is already in use')
			process.exit(1)
			break
		default:
			throw error
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
	let addr = server.address()
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port
	log4n.debug('Listening on ' + bind)
}

/**
 * Event listener for HTTP server "stop" event.
 */
function onStop () {
}
