'use strict';

const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));
const compose = require('koa-compose');

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

  _applyPlugins(ctx, next) {
    const fn = compose(this._plugins);
    return fn(ctx, next);
  }

  _makeRequest() {
    const context = {};

    return this._applyPlugins(context, (ctx, next) => {
      return this._execute()
        .then((res) => {
          ctx.res = res;
          return next();
        });
    }).then(() => {
      return context;
    });
  }

  asBody() {
    return this._makeRequest()
      .then((ctx) => {
        return ctx.res.body;
      });
  }
}

module.exports = Blackadder;
