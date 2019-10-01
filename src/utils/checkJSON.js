const querystring = require('querystring');
const Log4n = require('./log4n.js');

module.exports = function(context, object) {
	const log4n = new Log4n(context, '/utils/checkJSON');

	try {
		let result = JSON.parse(object);
		// log4n.object(result, "result");
		log4n.debug('done - Ok');
		return result;
	} catch (exception) {
        log4n.object(exception.stack, 'exception');
        log4n.debug('done - raw datas');
        return querystring.parse(object);
	}
};