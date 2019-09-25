const querystring = require('querystring');
const Log4n = require('./log4n.js');

module.exports = function(context, object) {
	const log4n = new Log4n(context, '/utils/checkJSON');

	try {
		log4n.debug('done - Ok');
		return JSON.parse(object);
	} catch (e) {
        log4n.object(e, 'exception');
        log4n.debug('done - raw datas');
        return querystring.parse(object);
	}
};