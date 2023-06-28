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

const assert = require('chai').assert;
const expect = require('chai').expect;
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');
const TestsUtilsAccounts = require('../000-SDK/testsUtilsAccounts');

let testsUtilsAccounts = new TestsUtilsAccounts();

let accountMock1;
const mock1 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test018",
    lastname: "mock1",
    email: "test018.mock1@iotdb.com",
    admin: null,
    active: null,
    session_id: null,
    creation_date: null,
    current_connexion_date: null,
    last_connexion_date: null,
    token: null
};
const mock2 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test018",
    lastname: "mock2",
    email: "test018.mock2@iotdb.com",
    admin: true,
    active: true,
    session_id: "0123456789",
    creation_date: null,
    current_connexion_date: null,
    last_connexion_date: null,
    token: null
};

describe('018 - patch account nok', () => {
    before(done => {
        let promiseArray = [];
        promiseArray.push(testsUtilsAccounts.create(testsUtilsAccounts.getPost(mock1)));

        Promise.all(promiseArray)
            .then(responses => {
                accountMock1 = responses[0];
                done();
            })
            .catch(errors => {
                console.log("errors : %j", errors);
                done(errors);
            });
    });

    after(done => {
        let promiseArray = [];
        promiseArray.push(testsUtilsAccounts.deleteIfExists(accountMock1.id, accountMock1.token));

        Promise.all(promiseArray)
            .then(responses => {
                done();
            })
            .catch(errors => {
                console.log("errors : %j", errors);
                done(errors);
            });
    });

    it(`update ${mock1.id} account with wrong token`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock2);
            superAgent
                .patch(`${testsUtils.getServerUrlVersion()}/account/${accountMock1.id}/012345678`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    expect(error).to.have.property('status', 404);
                    expect(response).to.have.property('status', 404);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`update ${mock1.id} account with empty body`, done => {
        try {
            superAgent
                .patch(`${testsUtils.getServerUrlVersion()}/account/${accountMock1.id}/${accountMock1.token}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send()
                .end((error, response) => {
                    console.log('error: %j', error);
                    expect(error).to.have.property('status', 400);
                    expect(response).to.have.property('status', 400);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});