const fs = require('fs');
const path = require('path');

let app = undefined;

let serverUrl = undefined;
let serverUrlVersion = undefined;

class TestsUtils {
    static initEnv() {
        const config = require('./getconfig.js');
        Object.keys(config.env).forEach(key => {
            if (config.env.hasOwnProperty(key)) {
                let value = config.env[key];
                // console.log('key: %s/type: %s/value: %j', key, typeof value, value);
                if (Array.isArray(value)) {
                    process.env[key] = JSON.stringify(value);
                } else {
                    process.env[key] = value;
                }
            }
        });
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    }

    static startServer() {
        return new Promise((resolve, reject) => {
            if (app === undefined) {
                console.log("app never started. Start the app.");
                TestsUtils.initEnv();
                app = require('../../src/server.js');
                console.log("Wait server starting");
                setTimeout(() => {
                    console.log("Server started");
                    resolve(app);
                }, 2000);
            } else {
                console.log("app already started. Return the app.");
                resolve(app);
            }
        });
    }

    static getServer() {
        return app;
    }

    static getServerUrl() {
        return serverUrl;
    }

    static getServerUrlVersion() {
        return serverUrlVersion;
    }

    static getConfiguration() {
        TestsUtils.initEnv();
        let confPath = path.join(process.cwd(), 'src', 'config', 'Configuration.js');
        let configuration = require(confPath);
        serverUrl = configuration.server.protocol + '://' + configuration.server.hostname + ':' + configuration.server.port;
        serverUrlVersion = serverUrl + '/' + configuration.server.api_version;
        return configuration;
    }

    static defineRandomValue() {
        const rand = ((Math.random() * 1000) | 1);
        return String(Date.now()) + ("0000" + rand).substring(("0000" + rand).length - 3);
    }

    static httpsClientOptions() {
        return {
            ca: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'ca-dev-crt.pem'), 'utf-8'),
            key: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'client-key.pem'), 'utf-8'),
            cert: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'client-crt.pem'), 'utf-8')
        };
    }

    static httpsHackerOptions() {
        return {
            ca: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'ca-dev-crt.pem'), 'utf-8'),
            key: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'hacker-key.pem'), 'utf-8'),
            cert: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'hacker-crt.pem'), 'utf-8')
        };
    }

    static httpsFakeOptions() {
        return {
            ca: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'fake-ca-dev-crt.pem'), 'utf-8'),
            key: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'fake-client-key.pem'), 'utf-8'),
            cert: fs.readFileSync(path.join(process.cwd(), 'test', '000-certificate', 'fake-client-crt.pem'), 'utf-8')
        };
    }
}

module.exports = TestsUtils;
