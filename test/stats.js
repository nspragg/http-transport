'use strict';

const sinon = require('sinon');
const nock = require('nock');
const assert = require('chai').assert;
const sandbox = sinon.sandbox.create();

const Blackadder = require('..');
const stats = require('../lib/plugins/stats');

const host = 'http://www.example.com';
const url = 'http://www.example.com/';
const api = nock(host);
const stubbedStats = {
    increment: sandbox.stub(),
    timing: sandbox.stub()
};

describe('stats', () => {
    beforeEach(() => {
        api.get('/').reply(200);
    });

    it('increments counter http.requests for each request', () => {
        return Blackadder.createClient()
            .get(url)
            .use(stats(stubbedStats))
            .asBody()
            .catch(assert.ifError)
            .then(() => {
                sinon.assert.calledWith(stubbedStats.increment, 'http.requests');
            });
    });

    it('increments counter a request counter with the name of the client if one is provided', () => {
        return Blackadder.createClient()
            .get(url)
            .use(stats(stubbedStats, 'my-client'))
            .asBody()
            .catch(assert.ifError)
            .then(() => {
                sinon.assert.calledWith(stubbedStats.increment, 'my-client.requests');
            });
    });

    it('increments a request counter with the name of the client and feed if provided', () => {
        return Blackadder.createClient()
            .get(url)
            .use(stats(stubbedStats, 'my-client', 'feedName'))
            .asBody()
            .catch(assert.ifError)
            .then(() => {
                sinon.assert.calledWith(stubbedStats.increment, 'my-client.feedName.requests');
            });
    });

    it('increments counter response for each response', () => {
        return Blackadder.createClient()
            .get(url)
            .use(stats(stubbedStats, 'my-client', 'feedName'))
            .asBody()
            .catch(assert.ifError)
            .then(() => {
                sinon.assert.calledWith(stubbedStats.increment, 'my-client.feedName.responses.200');
            });
    });

    it('records a timer for the response time', () => {
        return Blackadder.createClient()
            .get(url)
            .use(stats(stubbedStats, 'my-client', 'feedName'))
            .asBody()
            .catch(assert.ifError)
            .then(() => {
                sinon.assert.calledWith(stubbedStats.timing, 'my-client.feedName.response_time');
            });
    });
});
