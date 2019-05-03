const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const patch = require('../../../models/api/account/patch.js');
const accountGet = require('../../../models/api/account/get.js');

const responseError = require('../../../utils/responseError.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/account/patch');

    try {
        let userInfo = checkAuth(req, res);

        // log4n.object(req.params.id,'id');
        let id = req.params.id;
        let token = req.params.token;

        if (typeof id === 'undefined' || typeof token === 'undefined') {
            responseError({error_code: 400}, res, log4n);
            log4n.debug('done - missing arguments')
        } else {
            if (userInfo.admin || (id === userInfo.id)) {
                let updatedata;
                decodePost(req, res)
                    .then(datas => {
                        //log4n.object(datas, 'datas');
                        updatedata = datas;
                        return accountGet({id: id}, 0, 0, false)
                    })
                    .then(datas => {
                        if (typeof datas.error_code === 'undefined') {
                            log4n.object(datas, 'datas');
                            log4n.object(updatedata, 'updatedata');
                            let newdata = datas[0];
                            for (let key in updatedata) {
                                log4n.object(key, 'key');
                                newdata[key] = updatedata[key];
                            }
                            log4n.object(datas, 'datas');
                            return patch(id, token, newdata)
                        } else {
                            return (datas)
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.error_code === 'undefined') {
                            res.status(200).send(datas);
                            log4n.debug('done - ok');
                        } else {
                            responseError(datas, res, log4n);
                            log4n.debug('done - response error');
                        }
                    })
                    .catch(error => {
                        responseError(error, res, log4n);
                        log4n.debug('done - global catch');
                    })
            } else {
                log4n.error('user must be admin or account owner for this action');
                return errorparsing({error_code: 403});
            }
        }
    } catch (exception) {
        if (exception.message === "403") {
            responseError({error_code: 403}, res, log4n);
        } else {
            log4n.error(exception.stack);
            responseError({error_code: 500}, res, log4n);
        }
    }
};
