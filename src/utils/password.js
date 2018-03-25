const Log4n = require('./log4n.js');
const errorparsing = require('./errorparsing.js');

module.exports = function () {
    const log4n = new Log4n('/utils/password');

    return new Promise(function (resolve, reject) {
        try {
            const refstr = "0123456789abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let value = "";
            let passw = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

            while (!value.match(passw)) {
                value = "";
                for (let i = 0; i < 16; i++) {
                    value += refstr.substr(Math.round(Math.random() * refstr.length), 1);
                }
            }
            resolve(value);
        } catch(error) {
            log4n.object(error, 'error');
            reject(errorparsing(error));
            log4n.debug('done - global catch')
        }
    });
};
