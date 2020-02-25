const assert = require('chai').assert;
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