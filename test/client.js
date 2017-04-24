'use strict';

const assert = require('assert');
const nock = require('nock');

const Blackadder = require('..');
const toJson = require('../lib/plugins/asJson');

const url = 'http://www.example.com/';
const host = 'http://www.example.com';
const api = nock(host);
var path = '/';

const simpleResponseBody = 'Illegitimi non carborundum';

const responseBody = {
  foo: 'bar'
};

describe('Blackadder', () => {
  beforeEach(() => {
    nock.disableNetConnect();
    nock.cleanAll();
    api.get(path).reply(200, simpleResponseBody);
  });

  describe('.asJson', () => {
    it('returns body of a JSON response', () => {
      nock.cleanAll();
      api.get(path).reply(200, responseBody);

      const client = Blackadder.createClient();
      return client
        .use(toJson())
        .get(url)
        .asBody()
        .then((body) => {
          assert.equal(body.foo, 'bar');
        });
    });
  });

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

  it('returns an error for a non 200 response', () => {
    nock.cleanAll();
    api.get(path).reply(500);

    const client = Blackadder.createClient();
    return client
      .get(url)
      .asBody()
      .catch((err) => {
        assert(err);
        assert.equal(err.message, 'Received HTTP code 500 for GET http://www.example.com/');
      });
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
    return client
      .get(url)
      .asBody()
      .catch((err) => {
        assert(err);
        assert.equal(err.headers['www-authenticate'], 'Bearer realm="/"');
      });
  });
});
