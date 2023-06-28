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

describe('001 - get /v1/status ok', () => {
    it('return server status', done => {
        try {
            let configuration = testsUtils.getConfiguration();
            superAgent
                .get(`${testsUtils.getServerUrl()}/status`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    console.log('error: %j', error);
                    assert.equal(error, null);
                    console.log('response: %j', response);
                    expect(response).to.have.property('status', 200);
                    // expect(response).to.be.json;
                    expect(response).to.have.property('text');
                    expect(response.text).to.contains('swagger_version', configuration.server.swagger);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    })
});