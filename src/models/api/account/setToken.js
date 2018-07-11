const moment = require('moment');
const Log4n = require('../../../utils/log4n.js');
const errorparsing = require('../../../utils/errorparsing.js');
const patch = require('./patch.js');
const accountGet = require('./get.js');
const mongoClient = require('../../mongodbupdate.js');
const createToken = require('./createToken.js');

module.exports = function (id) {
	const log4n = new Log4n('/models/api/account/setToken');
	log4n.object(id, 'id');
	
	return new Promise((resolve, reject) => {
		try {
			log4n.debug('storing token');
			if (typeof id === 'undefined') {
				reject(errorparsing({error_code: '400'}));
				log4n.debug('done - missing parameter');
			} else {
				let updateDatas;
				accountGet({id: id},0 ,0 , false)
					.then(account => {
						log4n.object(account, 'account');
						updateDatas = account[0];
						updateDatas.last_connexion_date = updateDatas.current_connexion_date;
						updateDatas.current_connexion_date = parseInt(moment().format('x'));
						//log4n.object(query, 'query');
						return createToken();
					})
					.then(token => {
						// log4n.object(token, 'token');
						updateDatas.token = token;
						let query = {id:id};
						log4n.object(query, 'query');
						return mongoClient('account', query, updateDatas);
					})
					.then(datas => {
						// log4n.object(datas, 'datas');
						if (typeof datas.error_code === 'undefined') {
							resolve(datas);
							log4n.debug('done - ok');
						} else {
							reject(datas);
							log4n.debug('done - wrong data');
						}
					})
					.catch(error => {
						log4n.object(error, 'error');
						reject(errorparsing(error));
						log4n.debug('done - promise catch');
					})
			}
		} catch (error) {
			log4n.debug('done - global catch');
			log4n.object(error, 'error');
			reject(errorparsing(error));
		}
	})
};