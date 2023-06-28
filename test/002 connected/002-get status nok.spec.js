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

'use strict';

const {describe, it} = require('mocha');
const {assert, expect} = require('chai');
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');

describe('002 - get /status not ok', () => {
    it('return server status', done => {
        try {
            let configuration = testsUtils.getConfiguration();
            const server = configuration.server.protocol + '://' + configuration.server.hostname + ':' + configuration.server.port + '0';
            superAgent
                .get(`${server}/status`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    assert.notEqual(error, null);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(true);
            done();
        }
    })
});