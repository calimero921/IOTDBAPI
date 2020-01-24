const mongodbConf = require('../../config/mongodb.js');
const mongodb = require('mongodb');

const Log4n = require('../../utils/log4n.js');
const errorParsing = require('../../utils/errorParsing.js');

module.exports = function (context) {
    const log4n = new Log4n(context, '/models/mongoconnexion');

    return new Promise(function (resolve, reject) {
        if (global.mongodbConnexion === null) {
            let url = mongodbConf.url;
            let mongoClient = mongodb.MongoClient;

            mongoClient.connect(url, mongodbConf.options)
                .then(client => {
                    log4n.debug('Connected successfully to server');
                    global.mongodbConnexion = client.db(mongodbConf.dbName);
                    resolve();
                    log4n.debug('done - ok (new)');
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    reject(errorParsing(error));
                    global.mongodbConnexion = null;
                    log4n.debug('done - global catch');
                });
        } else {
            resolve();
            log4n.debug('done - ok (reuse)');
        }
    });
};
