const Log4n = require('../../../utils/log4n.js')
const errorparsing = require('../../../utils/errorparsing.js')
const patch = require('./patch.js')
const accountGetByID = require('./getByID.js')
const setToken = require('./setToken.js')

module.exports = function (id, password) {
	const log4n = new Log4n('/models/api/account/setPassword')
	log4n.object(id, 'id')
	log4n.object(password, 'password')
	
	return new Promise((resolve, reject) => {
		try {
			log4n.debug('storing password')
			if (typeof id === 'undefined' || typeof password === 'undefined') {
				reject(errorparsing({error_code: '400'}))
				log4n.debug('done - missing parameter')
			} else {
				accountGetByID(id, false)
					.then(account => {
						let query = account[0]
						query.password = password
						// log4n.object(query, 'query');
						return patch(id, query)
					})
					.then(datas => {
						// log4n.object(datas, 'datas');
						if (typeof datas.error_code === 'undefined') {
							return setToken(id)
						}
						return datas
					})
					.then(datas => {
						// log4n.object(datas, 'datas');
						if (typeof datas.error_code === 'undefined') {
							resolve(datas)
							log4n.debug('done - ok')
						} else {
							reject(datas)
							log4n.debug('done - wrong data')
						}
					})
					.catch(error => {
						log4n.object(error, 'error')
						reject(errorparsing(error))
						log4n.debug('done - promise catch')
					})
			}
		} catch (error) {
			log4n.debug('done - global catch')
			log4n.object(error, 'error')
			reject(errorparsing(error))
		}
	})
}
