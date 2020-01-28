const mongoClient = require('../../../connectors/mongodb/delete.js');

const serverLogger = require('../../../utils/serverLogger.js');
const errorparsing = require('../../../utils/errorparsing.js');

module.exports = function (context, id, token) {
	const logger = serverLogger.child({
		source: '/models/api/account/delete.js',
		httpRequestId: context.httpRequestId
	});
	logger.debug(id,'id');
	logger.debug(token,'token');

	//traitement de suppression dans la base
	return new Promise((resolve, reject) => {
		if (typeof id === 'undefined') {
			logger.debug('missing paramater');
			reject(errorparsing(context, {status_code: 400}));
		} else {
			let query = {id: id, token: token};
			mongoClient(context,'account', query)
				.then(datas => {
					if (datas.status_code) {
						logger.debug('error: %j', datas);
						reject(errorparsing(context, datas));
					} else {
						resolve(datas);
					}
				})
				.catch(error => {
					logger.debug( 'error: %j', error);
					reject(errorparsing(context, error));
				})
		}
	})
};
