const sinon = require('sinon');
const nock = require('nock');
const _ = require('lodash');
const assert = require('chai').assert;
const sandbox = sinon.sandbox.create();

const HttpTransport = require('..');
const statsError = require('../lib/plugins/statsErrorPlugin');
const toError = require('../lib/plugins/toError');

const host = 'http://www.example.com';
const url = 'http://www.example.com/';
const api = nock(host);
const path = '/';
const stubbedStats = {
  increment: sandbox.stub(),
  timing: sandbox.stub()
};

function nockRetries(retry, opts) {
  const httpMethod = _.get(opts, 'httpMethod') || 'get';
  const successCode = _.get(opts, 'successCode') || 200;

  nock.cleanAll();
  api[httpMethod](path).times(retry).reply(500);
  api[httpMethod](path).reply(successCode);
}

describe('stats error plugin', () => {

  it('increments an attempts counter for every retry required', () => {
    nockRetries(2);

    return HttpTransport.createClient()
      .useGlobal(toError(), statsError(stubbedStats))
      .get(url)
      .retry(2)
      .asResponse()
      .catch(assert.ifError)
      .then((res) => {
        sinon.assert.called(stubbedStats.timing);
      });
  });

});
