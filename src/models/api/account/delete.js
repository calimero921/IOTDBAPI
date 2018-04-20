const Log4n = require('../../../utils/log4n.js')
const errorparsing = require('../../../utils/errorparsing.js')
const mongoClient = require('../../mongodbdelete.js')

module.exports = function (id, token) {
	const log4n = new Log4n('/models/api/account/delete')
	log4n.object(id,'id');
	log4n.object(token,'token');
	
	//traitement de suppression dans la base
	return new Promise(function (resolve, reject) {
		if (typeof id === 'undefined') {
			reject(errorparsing({error_code: 400}))
			log4n.debug('done - missing paramater')
		} else {
			let query = {id: id, token: token}
			mongoClient('account', query)
				.then(datas => {
					// log4n.object(datas, 'datas');
					if (typeof datas.error_code === 'undefined') {
						resolve(datas)
						log4n.debug('done - ok')
					} else {
						reject(errorparsing(datas))
						log4n.debug('done - response error')
					}
				})
				.catch(error => {
					log4n.object(error, 'error')
					reject(errorparsing(error))
					log4n.debug('done - promise catch')
				})
		}
	})
}
