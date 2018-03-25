const Log4n = require('./log4n.js');
const checkJSON = require('./checkJSON.js');

module.exports = function (req, res) {
	const log4n = new Log4n('/utils/decodePost');

	return new Promise((resolve, reject) => {
        try {
			let fullBody = '';
			req.on('data', (chunk) => {
				fullBody += chunk.toString();
				// log4n.object(fullBody, 'fullBody');
			});
			req.on('end', () => {
				const decodedBody = checkJSON(fullBody);
				// log4n.object(decodedBody, 'decodedBody');
				resolve(decodedBody);
                log4n.debug('done');
			});
			req.on('error', (err) => {
				log4n.error(err);
				reject('no data in post');
                log4n.debug('done');
			});
		} catch(err) {
			log4n.error(err);
			reject(err);
            log4n.debug('done');
		}
    });
};