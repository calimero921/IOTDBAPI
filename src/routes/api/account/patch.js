const Log4n = require('../../../utils/log4n.js')
const responseError = require('../../../utils/responseError.js')
const decodePost = require('../../../utils/decodePost.js')
const patch = require('../../../models/api/account/patch.js')
const getById = require('../../../models/api/account/getByID.js')

module.exports = function (req, res) {
	const log4n = new Log4n('/routes/api/account/patch')
	// log4n.object(req.params.id,'id');
	
	let id = req.params.id
	let token = req.params.token
	
	if (typeof id === 'undefined' || typeof token === 'undefined') {
		responseError({error_code: 400}, res, log4n)
		log4n.debug('done - missing arguments')
	} else {
		let updatedata;
		decodePost(req, res)
			.then(datas => {
				//log4n.object(datas, 'datas');
				updatedata = datas;
				return getById(id, false)
			})
			.then(datas => {
				log4n.object(datas, 'datas');
				if (typeof datas.error_code === 'undefined') {
					log4n.object(updatedata, 'updatedata');
					let newdata = datas[0];
					for(let key in updatedata) {
						log4n.object(key, 'key');
						newdata[key] = updatedata[key];
					}
					log4n.object(datas, 'datas');
					return patch(id, token, newdata)
				} else {
					return(datas)
				}
			})
			.then(datas => {
				// log4n.object(datas, 'datas');
				if (typeof datas.error_code === 'undefined') {
					res.status(200).send(datas)
					log4n.debug('done - ok')
				} else {
					responseError(datas, res, log4n)
					log4n.debug('done - response error')
				}
			})
			.catch(error => {
				responseError(error, res, log4n)
				log4n.debug('done - global catch')
			})
	}
}
