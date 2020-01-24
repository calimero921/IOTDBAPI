const Log4n = require('../../utils/log4n.js');
const connexion = require('./mongoconnexion.js');
const errorparsing = require('../../utils/errorParsing.js');

module.exports = function (context, collection, query) {
	const log4n = new Log4n(context, '/models/mongodbdelete');
	log4n.object(collection, 'collection');
	log4n.object(query, 'query');

	return new Promise((resolve, reject) => {
		connexion(context)
			.then(() => {
				try {
					let mdbcollection = mongodbConnexion.collection(collection);
					mdbcollection.findOneAndDelete(query)
						.then(datas => {
							// console.log('datas: ', datas);
							if (typeof datas === 'undefined') {
								reject(errorparsing(context, {status_code: 500}));
								log4n.debug('done - no data')
							} else {
								if (datas.ok === 1) {
									if (typeof datas.value === 'undefined' || datas.value === null) {
										reject(errorparsing(context, {status_code: 404}));
										log4n.debug('done - not found')
									} else {
										resolve(datas.value);
										log4n.debug('done - ok')
									}
								} else {
									reject(errorparsing(context, {status_code: 500}));
									log4n.debug('done - response error')
								}
							}
						})
						.catch(error => {
							log4n.object(error, 'error');
							reject(errorparsing(context, error));
							global.mongodbConnexion = null;
							log4n.debug('done - call catch')
						})
				} catch (error) {
					log4n.object(error, 'error');
					reject(errorparsing(context, error));
					log4n.debug('done - global catch')
				}
			})
	})
}