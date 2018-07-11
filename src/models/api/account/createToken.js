const Log4n = require('../../../utils/log4n.js');
const accountGet = require('./get.js');
const Generator = require('../generator.js');

module.exports = function() {
    const log4n = new Log4n('/models/account/createToken');

    return new Promise((resolve, reject) => {
        let generator = new Generator();
        let token = generator.keygen();
        log4n.object(token, 'token');
        let action = accountGet({token: token}, 0, 0, false)
            .then(data => {
                // restart token generation while existing (recursive promise!!!)
                // log4n.object(data, 'data');
                if (data.length > 0) {
                    token = generator.keygen();
                    log4n.object(token, 'token');
                    return action();
                }
            })
            .catch(error => {
                // log4n.object(error, 'Error');
                // log4n.object(token, 'token');
                resolve(token);
                log4n.debug('done - recursive promise end');
            })
    })
};