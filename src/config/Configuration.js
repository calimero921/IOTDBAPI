/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2023 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const serverConfig = require('./server.js');
const logsConfig = require('./logs.js');
const swaggerConfig = require('./swagger.js');
const mongodbConfig = require('./mongodb.js');
const oidcConfig = require('./oidc.js');
class Configuration {
    constructor() {
        console.log('Loading configuration');

        this.configurationObject = {};
        let env = process.env;

        //*******************************
        //* Global Server configuration *
        //*******************************
        this.configurationObject.server = serverConfig;
        if (env.SERVERPROTOCOL) this.configurationObject.server.protocol = env.SERVERPROTOCOL;
        if (env.SERVERHOSTNAME) this.configurationObject.server.hostname = env.SERVERHOSTNAME;
        if (env.SERVERPORT) this.configurationObject.server.port = parseInt(env.SERVERPORT);
        if (env.HTTPSCA) this.configurationObject.server.httpsCa = env.HTTPSCA;
        if (env.HTTPSPRIVATEKEY) this.configurationObject.server.httpsPrivateKey = env.HTTPSPRIVATEKEY;
        if (env.HTTPSCERTIFICATE) this.configurationObject.server.httpsCertificate = env.HTTPSCERTIFICATE;
        // console.log('server: %j', this.configurationObject.server);

        //**********************
        //* Logs configuration *
        //**********************
        this.configurationObject.logs = logsConfig;
        if (env.LOGLEVEL) this.configurationObject.logs.logLevel = env.LOGLEVEL;
        if (env.LOGDIR) this.configurationObject.logs.transport.file.dailyLogs.dirname = env.LOGDIR;
        // console.log('LOGTRANSPORT: %j', env.LOGTRANSPORT);
        if (env.LOGTRANSPORT) {
            let logTransportArray = [];
            if (Array.isArray(env.LOGTRANSPORT)) {
                logTransportArray = env.LOGTRANSPORT;
            } else {
                // logTransportArray = env.LOGTRANSPORT.split(',');
                logTransportArray = JSON.parse(env.LOGTRANSPORT);
            }
            // console.log('logTransportArray: %j', logTransportArray);
            Object.keys(this.configurationObject.logs.transport).forEach(transport => {
                // console.log('transport: %j', transport);
                let found = false;
                for (let idx = 0; idx < logTransportArray.length; idx++) {
                    if (logTransportArray.hasOwnProperty(idx)) {
                        // console.log('target: %j', logTransportArray[idx]);
                        if (logTransportArray[idx] === transport) found = true;
                    }
                }
                this.configurationObject.logs.transport[transport].active = found;
            });
        }
        // console.log('logs: %j', this.configurationObject.logs);

        //*************************
        //* Swagger configuration *
        //*************************
        if (swaggerConfig.status) {
            this.configurationObject.swagger = swaggerConfig;
            this.configurationObject.swagger.swaggerDefinition.info.description=this.configurationObject.server.description;
            this.configurationObject.swagger.swaggerDefinition.info.title=this.configurationObject.server.name;
            this.configurationObject.swagger.swaggerDefinition.info.version=this.configurationObject.server.swagger;
            this.configurationObject.swagger.swaggerDefinition.host=`${this.configurationObject.server.hostname}:${this.configurationObject.server.port.toString()}`;
        }

        //*************************
        //* MongoDB configuration *
        //*************************
        this.configurationObject.mongodb = mongodbConfig;
        if (env.MONGODBLOGIN) this.configurationObject.mongodb.login = env.MONGODBLOGIN;
        if (env.MONGODBPASSWD) this.configurationObject.mongodb.passwd = env.MONGODBPASSWD;
        if (env.MONGODBHOST) this.configurationObject.mongodb.host = env.MONGODBHOST;
        if (env.MONGODBPORT) this.configurationObject.mongodb.port = parseInt(env.MONGODBPORT);
        if (env.MONGODBADMDB) this.configurationObject.mongodb.adminDbName = env.MONGODBADMDB;
        if (env.MONGODBTIMEOUT) this.configurationObject.mongodb.connectTimeoutMS = parseInt(env.MONGODBTIMEOUT);
        if (env.MONGODBNAME) this.configurationObject.mongodb.dbName = env.MONGODBNAME;
        this.configurationObject.mongodb.url = `mongodb://${this.configurationObject.mongodb.login}:${this.configurationObject.mongodb.passwd}@${this.configurationObject.mongodb.host}:${this.configurationObject.mongodb.port.toString()}/${this.configurationObject.mongodb.adminDbName}?connectTimeoutMS=${this.configurationObject.mongodb.connectTimeoutMS.toString()}`;

        //**********************
        //* OIDC configuration *
        //**********************
        if (oidcConfig.status) {
            this.configurationObject.openIdConnect = oidcConfig;
        }
        // console.log(globalPrefix + "openIdConnect before: %j", this.configurationObject.openIdConnect);
        if (env.OIDCPROTOCOL) {
            this.configurationObject.openIdConnect.protocol = env.OIDCPROTOCOL;
        }
        if (env.OIDCHOSTNAME) {
            this.configurationObject.openIdConnect.hostname = env.OIDCHOSTNAME;
        }
        if (env.OIDCPORT) {
            this.configurationObject.openIdConnect.port = parseInt(env.OIDCPORT);
        }
        if (env.OIDCISSUER) {
            this.configurationObject.openIdConnect.issuer = env.OIDCISSUER;
        }
        if (env.OIDCAUDIENCE) {
            this.configurationObject.openIdConnect.audience = env.OIDCAUDIENCE;
        }
        // console.log(globalPrefix + "oidc after: %j", this.configurationObject.oidc);

        //***********************************
        //* proxy / authority configuration *
        //***********************************
        if (env.HTTPSCA) {
            this.configurationObject.server.httpsCa = env.HTTPSCA;
        }
        if (env.http_proxy) {
            this.configurationObject.openIdConnect.http_proxy = env.http_proxy;
        }
        if (env.HTTP_PROXY) {
            this.configurationObject.openIdConnect.http_proxy = env.HTTP_PROXY;
        }
        if (env.https_proxy) {
            this.configurationObject.openIdConnect.https_proxy = env.https_proxy;
        }
        if (env.HTTPS_PROXY) {
            this.configurationObject.openIdConnect.https_proxy = env.HTTPS_PROXY;
        }

        // console.log('ldap: %j', this.configurationObject.mongodb);
    }
}

module.exports = new Configuration().configurationObject;