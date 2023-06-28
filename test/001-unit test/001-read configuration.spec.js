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

const config = require('../000-SDK/getconfig');
const testsUtils = require('../000-SDK/testsUtils.js');
const path = require('path');
const assert = require('chai').assert;

describe('001 - read Configuration', () => {
    let configuration = testsUtils.getConfiguration();
    describe('test global configuration content', () => {
        it('should have an existing configuration', done => {
            assert.notEqual(typeof configuration, 'undefined');
            done();
        });
    });

    describe('test logs configuration content', () => {
        it('should have an existing logs configuration', done => {
            assert.notEqual(typeof configuration.logs, 'undefined');
            done();
        });
        it('should have \'' + config.env.LOGLEVEL + '\' in logs.logLevel', done => {
            assert.equal(configuration.logs.logLevel, config.env.LOGLEVEL);
            done();
        });
        it('should have an existing logs.dailyLogs', done => {
            assert.notEqual(typeof configuration.logs.transport.file.dailyLogs, 'undefined');
            done();
        });
        it('should have \'' + config.env.LOGDIR + '\' in logs.dailyLogs.dirname', done => {
            assert.equal(configuration.logs.transport.file.dailyLogs.dirname, config.env.LOGDIR);
            done();
        });
        it('should have an existing logs.dailyLogs.filename', done => {
            assert.notEqual(typeof configuration.logs.transport.file.dailyLogs.filename, 'undefined');
            done();
        });
        it('should have an existing logs.dailyLogs.datePattern', done => {
            assert.notEqual(typeof configuration.logs.transport.file.dailyLogs.datePattern, 'undefined');
            done();
        });
        it('should have an existing logs.dailyLogs.zippedArchive', done => {
            assert.notEqual(typeof configuration.logs.transport.file.dailyLogs.zippedArchive, 'undefined');
            done();
        });
        it('should have an existing logs.dailyLogs.maxSize', done => {
            assert.notEqual(typeof configuration.logs.transport.file.dailyLogs.maxSize, 'undefined');
            done();
        });
        it('should have an existing logs.dailyLogs.maxFiles', done => {
            assert.notEqual(typeof configuration.logs.transport.file.dailyLogs.maxFiles, 'undefined');
            done();
        });
    });

    describe('test mongodb configuration content', () => {
        it('should have an existing mongodb configuration', done => {
            assert.notEqual(typeof configuration.mongodb, 'undefined');
            done();
        });
        it('should have \'' + config.env.MONGODBLOGIN + '\' in mongodb.login', done => {
            assert.equal(configuration.mongodb.login, config.env.MONGODBLOGIN);
            done();
        });
        it('should have \'' + config.env.MONGODBPASSWD + '\' in mongodb.passwd', done => {
            assert.equal(configuration.mongodb.passwd, config.env.MONGODBPASSWD);
            done();
        });
        it('should have \'' + config.env.MONGODBHOST + '\' in mongodb.login', done => {
            assert.equal(configuration.mongodb.host, config.env.MONGODBHOST);
            done();
        });
        it('should have \'' + config.env.MONGODBPORT + '\' in mongodb.port', done => {
            assert.equal(configuration.mongodb.port, config.env.MONGODBPORT);
            done();
        });
        it('should have \'' + config.env.MONGODBADMDB + '\' in mongodb.adminDbName', done => {
            assert.equal(configuration.mongodb.adminDbName, config.env.MONGODBADMDB);
            done();
        });
        it('should have \'' + config.env.MONGODBTIMEOUT + '\' in mongodb.connectTimeoutMS', done => {
            assert.equal(configuration.mongodb.connectTimeoutMS, config.env.MONGODBTIMEOUT);
            done();
        });
        it('should have an existing mongodb.url', done => {
            assert.notEqual(typeof configuration.mongodb.url, 'undefined');
            done();
        });
    });

    describe('test server configuration content', () => {
        it('should have an existing server configuration', () => {
            assert.notEqual(typeof configuration.server, 'undefined');
        });
        it('should have an existing server.name', done => {
            assert.notEqual(typeof configuration.server.name, 'undefined');
            done();
        });
        it('should have an existing server.description', done => {
            assert.notEqual(typeof configuration.server.description, 'undefined');
            done();
        });
        it('should have \'' + config.env.PROTOCOL + '\' in server.protocol', done => {
            assert.equal(configuration.server.protocol, config.env.PROTOCOL);
            done();
        });
        it('should have \'' + config.env.HOSTNAME + '\' in server.hostname', done => {
            assert.equal(configuration.server.hostname, config.env.HOSTNAME);
            done();
        });
        it('should have \'' + config.env.PORT + '\' in server.port', done => {
            assert.equal(configuration.server.port, config.env.PORT);
            done();
        });
    })
});