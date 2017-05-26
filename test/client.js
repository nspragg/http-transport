'use strict';

const assert = require('chai').assert;
const nock = require('nock');
const sinon = require('sinon');

const Blackadder = require('..');
const toJson = require('../lib/plugins/asJson');
const toError = require('../lib/plugins/toError');
const log = require('../lib/plugins/logger');
const timeout = require('../lib/plugins/timeout');
const packageInfo = require('../package');

const sandbox = sinon.sandbox.create();

const url = 'http://www.example.com/';
const host = 'http://www.example.com';
const api = nock(host);
const path = '/';

const simpleResponseBody = 'Illegitimi non carborundum';

const responseBody = {
  foo: 'bar'
};

function assertResponse(response, expected) {
  assert.ok(expected);

  return response
    .catch(assert.ifError)
    .then((actual) => assert.deepEqual(actual, expected));
}

function assertFailure(promise, message) {
  return promise
    .then(() => assert.ok(false, 'Promise should have failed'))
    .catch((e) => {
      assert.ok(e)
      if (message) {
        assert.equal(e.message, message);
      }
    });
}

describe('Blackadder', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();
    api.get(path).reply(200, simpleResponseBody);
  });

  it('returns a response', () => {
    return Blackadder.createClient()
      .get(url)
      .asResponse()
      .then((res) => {
        assert.equal(res.body, simpleResponseBody);
      });
  });

  it('sets a default User-agent', () => {
    nock.cleanAll();

    const HeaderValue = `${packageInfo.name}/${packageInfo.version}`;
    nock(host, {
        reqheaders: {
          'User-Agent': HeaderValue
        }
      })
      .get(path)
      .reply(200, responseBody);

    return Blackadder.createClient()
      .get(url)
      .asResponse();
  });

  it('throws if a plugin is not a function', () => {
    assert.throws(() => {
      Blackadder.createClient()
        .use('bad plugin')
        .headers();
    }, TypeError, 'Plugin is not a function');
  });

  describe('.headers', () => {
    it('sends a custom headers', () => {
      nock.cleanAll();

      const HeaderValue = `${packageInfo.name}/${packageInfo.version}`;
      nock(host, {
          reqheaders: {
            'User-Agent': HeaderValue,
            foo: 'bar'
          }
        })
        .get(path)
        .reply(200, responseBody);

      const response = Blackadder.createClient()
        .get(url)
        .headers({
          'User-Agent': HeaderValue,
          foo: 'bar'
        })
        .asResponse();

      return response
        .catch(assert.ifError)
        .then((res) => {
          assert.equal(res.statusCode, 200);
        });
    });

    it('asserts for a missing header', () => {
      assert.throws(() => {
        Blackadder.createClient()
          .get(url)
          .headers();
      }, Error, 'missing headers');
    });

    it('asserts an empty header object', () => {
      assert.throws(() => {
        Blackadder.createClient()
          .get(url)
          .headers({});
      }, Error, 'missing headers');
    });
  });
});

describe('query strings', () => {
  it('supports adding a query string', function () {
    api.get('/?a=1').reply(200, simpleResponseBody);

    const client = Blackadder.createClient();
    return client
      .get(url)
      .query('a', 1)
      .asBody()
      .then((body) => {
        assert.equal(body, simpleResponseBody);
      });
  });

  it('supports multiple query strings', function () {
    nock.cleanAll();
    api.get('/?a=1&b=2&c=3').reply(200, simpleResponseBody);

    const client = Blackadder.createClient();
    return client
      .get(url)
      .query({
        'a': 1,
        'b': 2,
        'c': 3,
      })
      .asBody()
      .then((body) => {
        assert.equal(body, simpleResponseBody);
      });
  });

  it('asserts empty query strings object', () => {
    assert.throws(() => {
      Blackadder.createClient()
        .get(url)
        .query({});
    }, Error, 'missing query strings');
  });
});

describe('plugins', () => {
  it('supports a per request plugin', () => {
    nock.cleanAll();
    api.get(path).times(2).reply(200, simpleResponseBody);

    const toUpperCase = () => {
      return (ctx, next) => {
        return next().then(() => {
          ctx.res.body = ctx.res.body.toUpperCase();
        });
      };
    };
    const client = Blackadder.createClient();

    const upperCaseResponse = client
      .get(url, toUpperCase())
      .asBody();

    const lowerCaseResponse = client
      .get(url)
      .asBody();

    return Promise.all([upperCaseResponse, lowerCaseResponse])
      .then((results) => {
        assert.equal(results[0], simpleResponseBody.toUpperCase());
        assert.equal(results[1], simpleResponseBody);
      });
  });

  it('throws if a global plugin is not a function', () => {
    assert.throws(() => {
      Blackadder.createClient()
        .use('bad plugin')
        .headers();
    }, TypeError, 'Plugin is not a function');
  });

  it('throws if a per request plugin is not a function', () => {
    assert.throws(() => {
      const client = Blackadder.createClient();
      client.get(url, 'bad plugin');
    }, TypeError, 'Plugin is not a function');
  });

  describe('toJson', () => {
    it('returns body of a JSON response', () => {
      nock.cleanAll();
      api.get(path).reply(200, responseBody);

      const client = Blackadder.createClient();
      client.use(toJson());

      return client
        .get(url)
        .asBody()
        .then((body) => {
          assert.equal(body.foo, 'bar');
        });
    });
  });

  describe('timeout', () => {
    it('sets the a timeout', () => {
      nock.cleanAll();
      api.get('/')
        .socketDelay(1000)
        .reply(200, simpleResponseBody);

      const client = Blackadder.createClient();
      const response = client
        .use(timeout(20))
        .get(url)
        .asBody();

      return assertFailure(response, 'Request failed for http://www.example.com/ ESOCKETTIMEDOUT');
    });

    it('default timeout?');
  })

  describe('logging', () => {
    it('logs each request at info level when a logger is passed in', () => {
      api.get(path).reply(200);

      const stubbedLogger = {
        info: sandbox.stub(),
        warn: sandbox.stub()
      };

      return Blackadder.createClient()
        .get(url)
        .use(log(stubbedLogger))
        .asBody()
        .catch(assert.ifError)
        .then(() => {
          const message = stubbedLogger.info.getCall(0).args[0];
          assert.match(message, /GET http:\/\/www.example.com\/ 200 \d+ ms/);
        });
    });
  });

  describe('toError', () => {
    it('returns an error for a non 200 response', () => {
      nock.cleanAll();
      api.get(path).reply(500);

      const client = Blackadder.createClient();
      const response = client
        .use(toError())
        .get(url)
        .asBody();

      return assertFailure(response, 'Received HTTP code 500 for GET http://www.example.com/')
    });

    it('includes the status code in the error for a non 200 response', () => {
      nock.cleanAll();
      api.get(path).reply(500);

      const client = Blackadder.createClient();
      return client
        .get(url)
        .asBody()
        .catch((err) => {
          assert(err);
          assert.equal(err.statusCode, 500);
        });
    });

    it('includes the headers in the error for a non 200 response', function () {
      nock.cleanAll();
      api.get(path).reply(500, {
        error: 'this is the body of the error'
      }, {
        'www-authenticate': 'Bearer realm="/"'
      });

      const client = Blackadder.createClient();
      const response = client
        .use(toError())
        .get(url)
        .asBody();

      return response
        .then(() => assert.ok(false, 'Promise should have failed'))
        .catch((err) => {
          assert(err);
          assert.equal(err.headers['www-authenticate'], 'Bearer realm="/"');
        });
    });
  });
});
