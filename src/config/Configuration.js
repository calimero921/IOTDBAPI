const serverConfig = require('./server.js');
const logsConfig = require('./logs.js');
const swaggerConfig = require('./swagger.js');
const mongodbConfig = require('./mongodb.js');

class Configuration {
    constructor() {
        console.log('Loading configuration');

        this.configurationObject = {};
        // let env = process.env;

        this.configurationObject.server = serverConfig;
        // if (env.PROTOCOL) this.configurationObject.server.protocol = env.PROTOCOL;
        // if (env.HOSTNAME) this.configurationObject.server.hostname = env.HOSTNAME;
        // if (env.PORT) this.configurationObject.server.port = env.PORT;
        // if (env.HTTPSCA) this.configurationObject.server.httpsCa = env.HTTPSCA;
        // if (env.HTTPSPRIVATEKEY) this.configurationObject.server.httpsPrivateKey = env.HTTPSPRIVATEKEY;
        // if (env.HTTPSCERTIFICATE) this.configurationObject.server.httpsCertificate = env.HTTPSCERTIFICATE;
        // console.log('server: %j', this.configurationObject.server);

        this.configurationObject.logs = logsConfig;
        // if (env.LOGLEVEL) this.configurationObject.logs.logLevel = env.LOGLEVEL;
        // if (env.LOGDIR) this.configurationObject.logs.transport.file.dailyLogs.dirname = env.LOGDIR;
        // // console.log('LOGTRANSPORT: %j', env.LOGTRANSPORT);
        // if (env.LOGTRANSPORT) {
        //     let logTransportArray = [];
        //     if (Array.isArray(env.LOGTRANSPORT)) {
        //         logTransportArray = env.LOGTRANSPORT;
        //     } else {
        //         // logTransportArray = env.LOGTRANSPORT.split(',');
        //         logTransportArray = JSON.parse(env.LOGTRANSPORT);
        //     }
        //     // console.log('logTransportArray: %j', logTransportArray);
        //     Object.keys(this.configurationObject.logs.transport).forEach(transport => {
        //         // console.log('transport: %j', transport);
        //         let found = false;
        //         for (let idx = 0; idx < logTransportArray.length; idx++) {
        //             if (logTransportArray.hasOwnProperty(idx)) {
        //                 // console.log('target: %j', logTransportArray[idx]);
        //                 if (logTransportArray[idx] === transport) found = true;
        //             }
        //         }
        //         this.configurationObject.logs.transport[transport].active = found;
        //     });
        // }
        // console.log('logs: %j', this.configurationObject.logs);

        if(swaggerConfig.status) this.configurationObject.swagger = swaggerConfig;

        this.configurationObject.mongodb = mongodbConfig;
        // if (env.MONGODBURL) this.configurationObject.mongodb.url = env.MONGODBURL;
        // if (env.MONGODBNAME) this.configurationObject.mongodb.dbName = env.MONGODBNAME;
        // console.log('ldap: %j', this.configurationObject.mongodb);
    }
}

module.exports = new Configuration().configurationObject;