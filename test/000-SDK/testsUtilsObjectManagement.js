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

const uuid = require('uuid');

class TestsUtilsObjectManagement {
    constructor() {
    }

    defineRandomId() {
        let node = [];
        for(let i=0; i<6; i++) {
            node.push(parseInt(Math.floor(Math.random()*16)), 16);
        }
        return uuid.v1({node: node});
    }

    defineRandomSessionId() {
        const dictionnary = "0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghisjklmopqrstuvwxyz_";
        const keylength = 32;
        let result = "";

        for(let i=0; i < keylength; i++) {
            result = result + dictionnary.substr(Math.floor(Math.random()*dictionnary.length), 1);
        }
        return result;
    }
}

module.exports = TestsUtilsObjectManagement;