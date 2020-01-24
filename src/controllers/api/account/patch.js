const Log4n = require('../../../utils/log4n.js');
const checkAuth = require('../../../utils/checkAuth.js');
const decodePost = require('../../../utils/decodePost.js');
const patch = require('../../../models/api/account/patch.js');
const get = require('../../../models/api/account/get.js');
const responseError = require('../../../utils/responseError.js');

/**
 * This function comment is parsed by doctrine
 * @route PATCH /1.0.0/account/{id}/{token}
 * @group Account - Operations about account
 * @param {string} id.path.required - eg: 23df8bad-ca36-4dba-90e0-1a69f0f016b8
 * @param {string} token.path.required - eg: FCB108968C990419BD5403D1F12E60C4
 * @param {Account.model} account.body.required - User details
 * @returns {Account.model} 200 - User info
 * @returns {Error} 403 - Forbidden
 * @returns {Error} 404 - Not found
 * @returns {Error} default - Unexpected error
 * @security Bearer
 */
module.exports = function (req, res) {
    let context = {httpRequestId: req.httpRequestId};
    const log4n = new Log4n(context, '/routes/api/account/patch');

    try {
        let userInfo = checkAuth(context, req, res);

        let id = req.params.id;
        log4n.object(id, 'id');
        let token = req.params.token;
        log4n.object(token, 'token');

        if (typeof id === 'undefined' || typeof token === 'undefined') {
            responseError(context, {status_code: 400, status_message: 'Missing parameters'}, res, log4n);
            log4n.debug('done - missing arguments')
        } else {
            if (userInfo.admin || (id === userInfo.id)) {
                let updatedata;
                decodePost(context, req, res)
                    .then(datas => {
                        //log4n.object(datas, 'datas');
                        updatedata = datas;
                        //supprime les champs id et token des données pouvant être mise à jour
                        if (typeof updatedata.id !='undefined') {
                            delete updatedata.id;
                        }
                        if (typeof updatedata.token !='undefined') {
                            delete updatedata.token;
                        }
                        return get(context, {id: id}, 0, 0, false)
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.status_code === 'undefined') {
                            log4n.object(datas, 'datas');
                            log4n.object(updatedata, 'updatedata');
                            let newdata = datas[0];
                            if(typeof newdata !='undefined') {
                                for (let key in updatedata) {
                                    // log4n.object(key, 'key');
                                    newdata[key] = updatedata[key];
                                }
                                log4n.object(newdata, 'newdata');
                                return patch(context, id, token, newdata)
                            } else {
                                return  {status_code:'404'};
                            }
                        } else {
                            return (datas)
                        }
                    })
                    .then(datas => {
                        // log4n.object(datas, 'datas');
                        if (typeof datas.status_code === 'undefined') {
                            res.status(200).send(datas);
                            log4n.debug('done - ok');
                        } else {
                            responseError(context, datas, res, log4n);
                            log4n.debug('done - response error');
                        }
                    })
                    .catch(error => {
                        responseError(context, error, res, log4n);
                        log4n.debug('done - global catch');
                    })
            } else {
                responseError(context, {status_code: 403}, res, log4n);
                log4n.debug('done - Forbidden');
            }
        }
    } catch (exception) {
            log4n.error(exception.stack);
            responseError(context, exception, res, log4n);
    }
};
