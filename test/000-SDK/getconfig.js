const argv = require('yargs').argv;
const fs = require('fs');

class GetConfig {
    constructor() {
        this.jsonParsed = {};

        if (typeof argv.config !== 'undefined') {
            let jsonData = fs.readFileSync(argv.config);
            this.jsonParsed = JSON.parse(jsonData);
        }
    }
}

module.exports = new GetConfig().jsonParsed;
