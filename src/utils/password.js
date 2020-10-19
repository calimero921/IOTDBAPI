const serverLogger = require('./serverLogger.js');
const errorParsing = require('./errorParsing.js');

module.exports = function (context) {
    const logger = serverLogger.child({
        source: '/utils/password.js',
        httpRequestId: context.httpRequestId
    });

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
        } catch (exception) {
            logger.error('exception: %s', exception.stack);
            reject(errorParsing(context, exception));
        }
    });
};
