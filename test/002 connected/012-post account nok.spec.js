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
const TestsUtilsAccounts = require('../000-SDK/testsUtilsAccounts');

let testsUtilsAccounts = new TestsUtilsAccounts();

let accountMock1;
const mock1 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test012",
    lastname: "mock1",
    email: "test012.mock1@iotdb.com",
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
    firstname: "test012",
    lastname: "mock2",
    email: "test012.mock2@iotdb.com",
    admin: null,
    active: null,
    session_id: null,
    creation_date: null,
    current_connexion_date: null,
    last_connexion_date: null,
    token: null
};

describe('012 - post /account nok', () => {
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
        if (accountMock1) promiseArray.push(testsUtilsAccounts.deleteIfExists(accountMock1.id, accountMock1.token));
        Promise.all(promiseArray)
            .then(responses => {
                done();
            })
            .catch(errors => {
                console.log("errors : ", errors);
                done(errors);
            });
    });

    it(`conflict while attempting to create ${mock1.id} account again`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock1);
            console.log('sentBody: %j', sentBody);
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    expect(error).to.have.property('status',409);
                    expect(response).to.have.property('status',409);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`error creating empty account`, done => {
        try {
            let sentBody = {};
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    expect(error).to.have.property('status',400);
                    expect(response).to.have.property('status',400);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`error creating account firstname missing`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock2);
            delete sentBody.firstname;
            console.log('sentBody: %j', sentBody);
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    expect(error).to.have.property('status',400);
                    expect(response).to.have.property('status',400);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`error creating account lastname missing`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock2);
            delete sentBody.lastname;
            console.log('sentBody: %j', sentBody);
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    expect(error).to.have.property('status',400);
                    expect(response).to.have.property('status',400);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`error creating account email missing`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock2);
            delete sentBody.email;
            console.log('sentBody: %j', sentBody);
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    expect(error).to.have.property('status',400);
                    expect(response).to.have.property('status',400);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});
