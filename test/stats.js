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

describe('stats', () => {
    it('increments counter http.requests for each request', () => {
        api.get('/').reply(200);

        const stubbedStats = {
            increment: sandbox.stub(),
            timing: sandbox.stub()
        };

        return Blackadder.createClient()
            .get(url)
            .use(stats(stubbedStats))
            .asBody()
            .catch(assert.ifError)
            .then(() => {
                sinon.assert.calledWith(stubbedStats.increment, 'http.requests');
            });
    });
});
