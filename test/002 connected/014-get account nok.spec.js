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

const {describe, it} = require('mocha');
const {assert, expect} = require('chai');
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');
const TestsUtilsAccounts = require('../000-SDK/testsUtilsAccounts');

let testsUtilsAccounts = new TestsUtilsAccounts();

const mock1 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test014",
    lastname: "mock1",
    email: "test014.mock1@iotdb.com",
    session_id: testsUtilsAccounts.defineRandomSessionId()
};

describe('014 - get account nok', () => {
    it(`return 404 error when ${mock1.id} user is not found`, done => {
        try {
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/account/id/${mock1.id}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    expect(error).to.have.property('status',404);
                    expect(response).to.have.property('status',404);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`return 404 error when ${mock1.email} user is not found`, done => {
        try {
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/account/email/${mock1.email}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    expect(error).to.have.property('status',404);
                    expect(response).to.have.property('status',404);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`return 404 error when ${mock1.session_id} user is not found`, done => {
        try {
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/account/session/${mock1.session_id}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    expect(error).to.have.property('status',404);
                    expect(response).to.have.property('status',404);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});