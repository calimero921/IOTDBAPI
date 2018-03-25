const log4nConf = require('../config/log4nconf.js');
const fs = require('fs');

module.exports = Log4n;

function Log4n(path) {
	const dispPath = path;

	this.severe = function(message) {log(dispPath, 'SEVERE', message);};
	this.error = function(message) {log(dispPath, 'ERROR', message);};
	this.warn = function(message) {log(dispPath, 'WARN', message);};
	this.info = function(message) {log(dispPath, 'INFO', message);};
	this.debug = function(message) {log(dispPath, 'DEBUG', message);};
	this.object = function(object, name) {readObject(dispPath, object, name);};

	this.debug('initialisation');
}


function log(path, level, message) {
//	console.log('log4n/path:' + path);
//	console.log('log4n/level:' + level);
//	console.log('log4n/message:' + message);

	level = level.toUpperCase();
	
	var display = false;

//	console.log('log4n/loglevel:' + log4nConf.logLevel);
	switch (log4nConf.logLevel.toUpperCase()) {
	case 'DEBUG':
		if(level === 'DEBUG') display = true;
	case 'INFO':
		if(level === 'INFO') display = true;
	case 'WARN':
		if(level === 'WARN') display = true;
	case 'ERROR':
		if(level === 'ERROR') display = true;
	case 'SEVERE':
		if(level === 'SEVERE') display = true;
	default:
		break;
	}
	
	if(display === true) {
		console.log(logMessage(path, level, message));
		writeInFile(logMessage(path, level, message));
	}
}

function logMessage(path, level, message) {
	return getDateNow() + ' ' + getTimeNow() + ' ' + complete(level, 6, ' ', true) + ' ' + path + ' - ' + message;
}

function readObject(path, object, name) {
	switch (typeof object) {
		case 'object':
			for(var key in object) {
				readObject(path, object[key], name + '.' + key);
			}
			break;
		case 'undefined':
			object = 'undefined';
		case 'boolean':
		case 'number':
		case 'string':
		default:
			log(path, 'DEBUG', name + ' => ' + object);
			break;
	}
}

function writeInFile(message) {
	const path = log4nConf.logPath;
	const filename = path + '/' + log4nConf.logFile;
	const alternat = path + '/' + log4nConf.logFilepattern;
	
	if(fs.existsSync(filename)) {
		const filedate = getFirstDate(filename);
		if(filedate.length > 0) {
			if(filedate !== getDateNow()) {
				fs.renameSync(filename, alternat.replace('YYYY-MM-DD', filedate));
			}
		}
	}
	
	fs.appendFileSync(filename, message + '\n');
}

function getFirstDate(filepath) {
	var result = '';
	if(fs.existsSync(filepath)) {
		fs.readFileSync(filepath)
			.toString()
			.split('\n')
			.forEach(function(line) {
				if(result.length === 0) {
					if(line.length >= 10) {
						const datestamp = line.substr(0, 10);
						if((datestamp.substr(4, 1) === '-') && (datestamp.substr(7, 1) === '-')) {
							result = datestamp;
						}
					}
				}
			}
		);
	}
	return result;
}

function getDateNow() {
	const localDate = new Date();
	const dispYear = complete(localDate.getFullYear(), 4, '0', false);
	const dispMonth = complete(localDate.getMonth() + 1, 2, '0', false);
	const dispDay = complete(localDate.getDate(), 2, '0', false);
	return dispYear + '-' + dispMonth + '-' + dispDay;
}

function getTimeNow() {
	const localDate = new Date();
	const dispHour = complete(localDate.getHours(), 2, '0', false);
	const dispMinute = complete(localDate.getMinutes(), 2, '0', false);
	const dispSecond = complete(localDate.getSeconds(), 2, '0', false);
	const dispMillisecond = complete(localDate.getMilliseconds(), 3, '0');
	return dispHour + ':' + dispMinute + ':' + dispSecond + ',' + dispMillisecond;
}

function complete(value, size, char, before) {
	var result;
	
	if(before === true) {
		result = value + char.repeat(size);
		result = result.slice(0, size);
	} else {
		result = char.repeat(size) + value;
		result = result.slice(-size);
	}
	return result;
}