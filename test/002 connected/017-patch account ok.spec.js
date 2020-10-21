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

const assert = require('chai').assert;
const expect = require('chai').expect;
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');
const TestsUtilsAccounts = require('../000-SDK/testsUtilsAccounts');

let testsUtilsAccounts = new TestsUtilsAccounts();

let accountMock1;
const mock1 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test017",
    lastname: "mock1",
    email: "test017.mock1@iotdb.com",
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
    firstname: "test017",
    lastname: "mock2",
    email: "test017.mock2@iotdb.com",
    admin: true,
    active: true,
    session_id: "0123456789",
    creation_date: null,
    current_connexion_date: null,
    last_connexion_date: null,
    token: null
};

describe('017 - patch account ok', () => {
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

    it(`update ${mock1.id} account`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock2);
            superAgent
                .patch(`${testsUtils.getServerUrlVersion()}/account/${accountMock1.id}/${accountMock1.token}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 200);
                    expect(response.body).to.have.property('id', accountMock1.id);
                    expect(response.body).to.have.property('lastname', mock2.lastname);
                    expect(response.body).to.have.property('firstname', mock2.firstname);
                    expect(response.body).to.have.property('email', mock2.email);
                    expect(response.body).to.have.property('admin', mock2.admin);
                    expect(response.body).to.have.property('active', mock2.active);
                    expect(response.body).to.have.property('session_id', mock2.session_id);
                    expect(response.body).to.have.property('creation_date', accountMock1.creation_date);
                    expect(response.body).to.have.property('current_connexion_date');
                    expect(response.body).to.have.property('last_connexion_date');
                    expect(response.body).to.have.property('token');
                    accountMock1 = response.body;
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});