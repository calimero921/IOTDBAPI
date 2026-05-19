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

import fs from 'fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const argv = yargs(hideBin(process.argv)).parse()

class GetConfig {
    constructor() {
        this.jsonParsed = {};

        if (typeof argv.config !== 'undefined') {
            let jsonData = fs.readFileSync(argv.config);
            this.jsonParsed = JSON.parse(jsonData);
            initConf(this.jsonParsed);
        }
    }
}

function initConf(config) {
    Object.keys(config.env).forEach(key => {
        let value = config.env[key];
        if (typeof value === 'object') {
            process.env[key] = JSON.stringify(value);
        } else {
            process.env[key] = value;
        }
        // console.log('add %s = %s to ENV', key, process.env[key])
    })
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
}

export default new GetConfig().jsonParsed;
