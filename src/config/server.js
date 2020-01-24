const packageJSON = require('../../package.json');

module.exports = {
    name: 'IOTDB-API',
    description: 'API to access IOTDB application',
    url: "https://localhost:3443",
    protocol: 'https',
    hostname: 'localhost',
    port: '3443',
    ca_crt: 'ca-crt.pem',
    server_key: 'server-key.pem',
    server_crt: 'server-crt.pem',
    session_timeout: 3600000,
    api_version: 'v' + packageJSON.version.split('.')[0],
    swagger: packageJSON.version,
    date: '2019-09-18'
};