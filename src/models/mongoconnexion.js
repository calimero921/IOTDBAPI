const Log4n = require('../utils/log4n.js');
const errorparsing = require('../utils/errorparsing.js');
const mongodb = require('mongodb');
const mongodbconf = require('../config/mongodb.js');

module.exports = function () {
    const log4n = new Log4n('/models/mongoconnexion');

    return new Promise(function (resolve, reject) {
        if (global.mongodbConnexion === null) {
            let url = mongodbconf.url;
            let mongoClient = mongodb.MongoClient;
            let mongoOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            };

            mongoClient.connect(url, mongoOptions)
                .then(client => {
                    log4n.debug('Connected successfully to server');
                    global.mongodbConnexion = client.db(mongodbconf.dbName);
                    resolve();
                    log4n.debug('done - ok (new)');
                })
                .catch(error => {
                    log4n.object(error, 'error');
                    reject(errorparsing(error));
                    global.mongodbConnexion = null;
                    log4n.debug('done - global catch');
                });
        } else {
            resolve();
            log4n.debug('done - ok (reuse)');
        }
    });
};
