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
    firstname: "test015",
    lastname: "mock1",
    email: "test015.mock1@iotdb.com",
    admin: null,
    active: null,
    session_id: null,
    creation_date: null,
    current_connexion_date: null,
    last_connexion_date: null,
    token: null
};

describe('015 - delete account ok', () => {
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

    it(`delete ${mock1.id} account `, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock1);
            superAgent
                .delete(`${testsUtils.getServerUrlVersion()}/account/${accountMock1.id}/${accountMock1.token}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    console.log('error: %j', error);
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 204);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});
