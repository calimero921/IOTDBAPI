const querystring = require('querystring');
const Log4n = require('./log4n.js');

module.exports = function(object) {
	const log4n = new Log4n('/utils/checkJSON');

	try {
		return JSON.parse(object);
	} catch (e) {
        log4n.object(e, 'exception');
        log4n.debug('done: raw datas');
        return querystring.parse(object);
	}
};