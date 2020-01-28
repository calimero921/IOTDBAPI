const path = require('path');

const serverConfig = require('./server.js');

module.exports = {
    name:'swagger',
    status: true,
    swaggerDefinition: {
        info: {
            description: serverConfig.description,
            title: serverConfig.name,
            version: serverConfig.swagger,
        },
        host: serverConfig.hostname + ':' + serverConfig.port,
        basePath: '/' + serverConfig.api_version,
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['https'],
        // securityDefinitions: {
        //     Bearer: {
        //         type: 'apiKey',
        //         in: 'header',
        //         name: 'Authorization',
        //         description: ""
        //     }
        // },
        contact: {
            name: 'Emmanuel David',
            email: 'emmanuel.david@orange.com'
        }
    },
    basedir: __dirname, //app absolute path
    files: [path.join(process.cwd(),'src', 'controllers','**','*.js')] //Path to the API handle folder
};