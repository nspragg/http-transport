'use strict';

const compose = require('koa-compose');
const Promise = require('bluebird');
const httpRequestFactory = require('./transport/requestClient');
const context = require('./context');

function handleHttpRequest(ctx, next) {
  const httpRequest = httpRequestFactory.createRequest(ctx);
  return httpRequest()
    .then(() => {
      next()
    });
}

class Blackadder {
  constructor() {
    this._ctx = context.create();
    this._instancePlugins = [];
  }

  use(plugin) {
    this._ctx.addPlugin(plugin);
    return this;
  }

  get(url, plugin) {
    if (plugin) {
      this._ctx.addPlugin(plugin);
    }
    this._ctx.setMethod('GET');
    this._ctx.setUrl(url);
    return this;
  }

  _toObject(arr) {
    const obj = {};
    for (let i = 0; i < arr.length; i += 2) {
      obj[arr[i]] = arr[i + 1];
    }
    return obj;
  }

  header(header) {
    if (typeof header !== 'object') {
      header = this._toObject(Array.from(arguments));
    }
    Object.keys(header).forEach((key) => {
      this._ctx.addHeader(key, header[key]);
    });
    return this;
  }

  query(qs) {
    if (typeof qs !== 'object') {
      qs = this._toObject(Array.from(arguments));
    }
    Object.keys(qs).forEach((key) => {
      this._ctx.addQuery(key, qs[key]);
    });
    return this;
  }

  _applyPluginStack(ctx, next) {
    const fn = compose(ctx.getPlugins());
    return fn(ctx, next);
  }

  _executeRequest(ctx) {
    return this._applyPluginStack(ctx, handleHttpRequest)
      .then(() => {
        return ctx;
      });
  }

  asBody() {
    return this.asResponse().then((res) => res.body);
  }

  asResponse() {
    const requestContext = this._ctx;
    this._ctx = context.create();

    return Promise.resolve(this._executeRequest(requestContext))
      .then((ctx) => {
        return ctx.res;
      });
  }
}

module.exports = Blackadder;
