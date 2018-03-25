const Log4n = require('../../../utils/log4n.js');
const responseError = require('../../../utils/responseError.js');
const decodePost = require('../../../utils/decodePost.js');
const set = require('../../../models/api/device/set.js');

module.exports = function (req, res) {
    const log4n = new Log4n('/routes/api/device/post');

    //lecture des données postées
    decodePost(req, res)
        .then(datas => {
            // log4n.object(datas, 'datas');
            if(typeof datas === 'undefined') {
                //aucune donnée postée
                return {error:{code:400}};
            } else {
                //lecture des données postées
                return set(datas);
            }
        })
        .then(datas => {
            // console.log('datas:', datas);
            if(typeof datas === 'undefined') {
                //aucune données recue du processus d'enregistrement
                responseError({error:{code: 500}}, res, log4n);
                log4n.debug('done - no data');
            } else {
                //recherche d'un code erreur précédent
                if(typeof datas.code === 'undefined') {
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
