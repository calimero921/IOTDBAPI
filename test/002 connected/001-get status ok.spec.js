const assert = require('chai').assert;
const expect = require('chai').expect;
const superAgent = require('superagent');

const testsUtils = require('../000-SDK/testsUtils');

describe('001 - get /v1/status ok', () => {
    it('return server status', done => {
        try {
            let configuration = testsUtils.getConfiguration();
            superAgent
                .get(`${testsUtils.getServerUrlVersion()}/status`)
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
                    expect(response.text).to.contains('version', configuration.server.swagger);
                    expect(response.text).to.contains('last_update', configuration.server.last_update);
                    done();
                });
        } catch (exception) {
            console.log('exception: %s', exception.stack);
            assert.ok(false);
            done();
        }
    })
});