const assert = require('chai').assert;
const expect = require('chai').expect;
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');
const TestsUtilsAccounts = require('../000-SDK/testsUtilsAccounts');

let testsUtilsAccounts = new TestsUtilsAccounts();

let accountMock1;
const mock1 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test011",
    lastname: "mock1",
    email: "test011.mock1@iotdb.com",
    admin: null,
    active: null,
    session_id: null,
    creation_date: null,
    current_connexion_date: null,
    last_connexion_date: null,
    token: null
};
let accountMock2;
const mock2 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test011",
    lastname: "mock2",
    email: "test011.mock2@iotdb.com",
};

after(done => {
    let promiseArray = [];
    if (accountMock1) promiseArray.push(testsUtilsAccounts.deleteIfExists(accountMock1.id, accountMock1.token));
    if (accountMock2) promiseArray.push(testsUtilsAccounts.deleteIfExists(accountMock2.id, accountMock2.token));
    Promise.all(promiseArray)
        .then(responses => {
            done();
        })
        .catch(errors => {
            console.log("errors : ", errors);
            done(errors);
        });
});

describe('011 - post /account ok', () => {
    it(`create ${mock1.id} account default basic`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock1);
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 201);
                    expect(response.body).to.have.property('id');
                    expect(response.body).to.have.property('lastname', sentBody.lastname);
                    expect(response.body).to.have.property('firstname', sentBody.firstname);
                    expect(response.body).to.have.property('email', sentBody.email);
                    expect(response.body).to.have.property('admin', false);
                    expect(response.body).to.have.property('active', true);
                    expect(response.body).to.have.property('session_id');
                    expect(response.body).to.have.property('creation_date');
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

    it(`create ${mock2.id} account default advance`, done => {
        try {
            let sentBody = testsUtilsAccounts.getPost(mock2);
            superAgent
                .post(`${testsUtils.getServerUrlVersion()}/account`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .send(sentBody)
                .end((error, response) => {
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 201);
                    expect(response.body).to.have.property('id');
                    expect(response.body).to.have.property('lastname', sentBody.lastname);
                    expect(response.body).to.have.property('firstname', sentBody.firstname);
                    expect(response.body).to.have.property('email', sentBody.email);
                    expect(response.body).to.have.property('admin', sentBody.admin);
                    expect(response.body).to.have.property('active', sentBody.active);
                    expect(response.body).to.have.property('session_id');
                    expect(response.body).to.have.property('creation_date');
                    expect(response.body).to.have.property('current_connexion_date');
                    expect(response.body).to.have.property('last_connexion_date');
                    expect(response.body).to.have.property('token');
                    accountMock2 = response.body;
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});
