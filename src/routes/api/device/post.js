const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const decodePost = require('../../../utils/decodePost.js');
const set = require('../../../models/api/device/set.js');
const get = require('../../../models/api/device/get.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/post');

    let postData;
    //lecture des données postées
    decodePost(req, res)
        .then(datas => {
            // log4n.object(datas, 'datas');
            if(typeof datas === 'undefined') {
                //aucune donnée postée
                return {error_code:400};
            } else {
                postData = datas;
                //lecture des données postées
                let query = {manufacturer:postData.manufacturer, model:postData.model, serial:postData.serial, secret:postData.secret};
                return get(query, 0, 0, true);
            }
        })
        .then(datas => {
            // console.log('datas:', datas);
            if(typeof datas === 'undefined') {
                //aucune données recue du processus d'enregistrement
                responseError({error_code: 500}, res, log4n);
                log4n.debug('done - no data');
            } else {
                if (typeof datas.error_code === "undefined") {
                    //le device est déjà présent
                    return {error_code: 409};
                } else {
                    return set(postData)
                }
            }        })
        .then(datas => {
            // console.log('datas:', datas);
            if(typeof datas === 'undefined') {
                //aucune données recue du processus d'enregistrement
                responseError({error_code: 500}, res, log4n);
                log4n.debug('done - no data');
            } else {
                //recherche d'un code erreur précédent
                console.log('datas.error:', datas.error);
                if(typeof datas.error_code === 'undefined') {
                    //notification enregistrée
                    res.status(201).send(datas);
                    log4n.debug('done - ok');
                } else {
                    //erreur dans le processus d'enregistrement de la notification
                    responseError(datas, res, log4n);
                    log4n.debug('done - response error');
                }
            }
        })
        .catch(error => {
            responseError(error, res, log4n);
            log4n.debug('done - global catch');
        });
};
