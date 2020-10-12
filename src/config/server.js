const packageJSON = require('../../package.json');

module.exports = {
    name: 'IOTDB-API',
    description: 'API to access IOTDB application',
    protocol: 'https',
    hostname: 'localhost',
    port: '3443',
    api_version: 'v' + packageJSON.version.split('.')[0],
    httpsCa: 'ca-dev-crt.pem',
    httpsPrivateKey: 'server-key.pem',
    httpsCertificate: 'server-crt.pem',
    session_timeout: 3600000,
    swagger: packageJSON.version,
};