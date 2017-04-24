'use strict';

const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));
const compose = require('koa-compose');

function buildResponseError(url, res) {
  const error = new Error(`Received HTTP code ${res.statusCode} for GET ${url}`);
  error.statusCode = res.statusCode;
  error.headers = res.headers;
  return error;
}

class Blackadder {
  constructor() {
    this._url = undefined;
    this._queryStrings = {};
    this._plugins = [];
  }

  use(plugin) {
    this._plugins.push(plugin);
    return this;
  }

  get(url) {
    this._url = url;
    return this;
  }

  _hasQueryStrings() {
    return Object.keys(this._queryStrings).length > 0;
  }

  // execute and configure
  _execute() {
    const opts = {};
    if (this._hasQueryStrings()) {
      opts.qs = this._queryStrings;
    }
    return Request.getAsync(this._url, opts);
  }

  query(k, v) {
    if (typeof k === 'object') {
      Object.assign(this._queryStrings, k);
      return this;
    }
    this._queryStrings[k] = v;
    return this;
  }

  _applyPlugins(res) {
    // let i = this._plugins.length;
    // while (i--) {
    //   res = this._plugins[i].call(null, res);
    // }
    // return res;
    const ctx = {};
    ctx.res = res;
    const fn = compose(this._plugins);
    return fn(ctx);
  }

  asBody() {
    return this._execute()
      .then((res) => {
        if (res.statusCode != 200) {
          throw buildResponseError(this._url, res);
        }
        return this._applyPlugins(res)
          .then((ctx) => {
            return res.body;
          });
      });
  }
}

module.exports = Blackadder;
