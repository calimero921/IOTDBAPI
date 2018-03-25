const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const server = require('../../../config/server.js');
const getUsersByEmail = require('../../../models/api/account/getByEmail.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/recover');
    log4n.object(req.params.email, 'email');

    let user;
    getUsersByEmail(req.params.email)
        .then(datas => {
            // log4n.object(datas, 'datas');
            if (typeof datas === 'undefined') throw 'error reading database';
            if (datas.length === 0) throw 'no user for this email';
            user = datas[0];

            log4n.debug('get user info');
            let receiver = "";
            for (let key in datas) {
                receiver += ';' + datas[key].email;
            }
            receiver = receiver.substr(1);
            log4n.object(receiver, 'receiver');
        })
        .then(result => {
            log4n.object(result, 'result');
            let decode = decodeError(result);
            if (decode === 200) {
                res.sendStatus(200)
            } else {
                res.send(result);
            }
        })
        .catch(error => {
            log4n.object(error, 'Error');
            responseError(error, res, log4n);
        });
};

function decodeError(error) {
    const log4n = new Log4n('/routes/api/users/recover/decodeError');
    log4n.object(error, 'error');

    let value = {};
    value.error_code = "500";
    value.error_message = "Internal Server Error";
    if (typeof error !== 'undefined') {
        let code = error.substr(0, 3);
        switch (code) {
            case '250':
                value.error_code = 200;
                value.error_message = "ok";
                break;
            default:
                value.error_code = error.substr(0, 3);
                value.error_message = error.substr(3);
                break;
        }
    }
    log4n.object(value, 'value');
    return value;
}