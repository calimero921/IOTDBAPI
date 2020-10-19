/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

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
