const assert = require('chai').assert;
const expect = require('chai').expect;
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');
const TestsUtilsAccounts = require('../000-SDK/testsUtilsAccounts');

let testsUtilsAccounts = new TestsUtilsAccounts();

let accountMock1;
const mock1 = {
    id: testsUtilsAccounts.defineRandomId(),
    firstname: "test013",
    lastname: "mock1",
    email: "test013.mock1@iotdb.com",
    session_id: testsUtilsAccounts.defineRandomSessionId()
};

describe('013 - get account ok', () => {
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

    it(`return ${mock1.id} account by id`, done => {
        try {
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/account/id/${accountMock1.id}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 200);
                    expect(response.body[0]).to.have.property('id', accountMock1.id);
                    expect(response.body[0]).to.have.property('lastname', accountMock1.lastname);
                    expect(response.body[0]).to.have.property('firstname', accountMock1.firstname);
                    expect(response.body[0]).to.have.property('email', accountMock1.email);
                    expect(response.body[0]).to.have.property('admin', accountMock1.admin);
                    expect(response.body[0]).to.have.property('active', accountMock1.active);
                    expect(response.body[0]).to.have.property('session_id', accountMock1.session_id);
                    expect(response.body[0]).to.have.property('creation_date', accountMock1.creation_date);
                    expect(response.body[0]).to.have.property('current_connexion_date', accountMock1.current_connexion_date);
                    expect(response.body[0]).to.have.property('last_connexion_date', accountMock1.last_connexion_date);
                    expect(response.body[0]).to.have.property('token', accountMock1.token);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`return ${mock1.id} account by email`, done => {
        try {
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/account/email/${accountMock1.email}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 200);
                    expect(response.body[0]).to.have.property('id', accountMock1.id);
                    expect(response.body[0]).to.have.property('lastname', accountMock1.lastname);
                    expect(response.body[0]).to.have.property('firstname', accountMock1.firstname);
                    expect(response.body[0]).to.have.property('email', accountMock1.email);
                    expect(response.body[0]).to.have.property('admin', accountMock1.admin);
                    expect(response.body[0]).to.have.property('active', accountMock1.active);
                    expect(response.body[0]).to.have.property('session_id', accountMock1.session_id);
                    expect(response.body[0]).to.have.property('creation_date', accountMock1.creation_date);
                    expect(response.body[0]).to.have.property('current_connexion_date', accountMock1.current_connexion_date);
                    expect(response.body[0]).to.have.property('last_connexion_date', accountMock1.last_connexion_date);
                    expect(response.body[0]).to.have.property('token', accountMock1.token);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });

    it(`return ${mock1.id} account by session`, done => {
        try {
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/account/session/${accountMock1.session_id}`)
                .ca(testsUtils.httpsClientOptions().ca)
                .cert(testsUtils.httpsClientOptions().cert)
                .key(testsUtils.httpsClientOptions().key)
                .end((error, response) => {
                    assert.equal(error, null);
                    expect(response).to.have.property('status', 200);
                    expect(response.body[0]).to.have.property('id', accountMock1.id);
                    expect(response.body[0]).to.have.property('lastname', accountMock1.lastname);
                    expect(response.body[0]).to.have.property('firstname', accountMock1.firstname);
                    expect(response.body[0]).to.have.property('email', accountMock1.email);
                    expect(response.body[0]).to.have.property('admin', accountMock1.admin);
                    expect(response.body[0]).to.have.property('active', accountMock1.active);
                    expect(response.body[0]).to.have.property('session_id', accountMock1.session_id);
                    expect(response.body[0]).to.have.property('creation_date', accountMock1.creation_date);
                    expect(response.body[0]).to.have.property('current_connexion_date', accountMock1.current_connexion_date);
                    expect(response.body[0]).to.have.property('last_connexion_date', accountMock1.last_connexion_date);
                    expect(response.body[0]).to.have.property('token', accountMock1.token);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    });
});