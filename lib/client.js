'use strict';

const compose = require('koa-compose');

const httpRequestFactory = require('./transport/requestClient');

function handleHttpRequest(ctx, next) {
  const httpRequest = httpRequestFactory.createRequest(ctx);
  return httpRequest()
    .then(() => {
      next()
    });
}

class Blackadder {
  constructor() {
    this._url = undefined;
    this._queryStrings = {};
    this._headers = {};
    this._plugins = [];
  }

  use(plugin) {
    this._plugins.push(plugin);
    return this;
  }

  get(url) {
    this._method = 'GET'
    this._url = url;
    return this;
  }

  _toObject(arr) {
    const obj = {};
    for (let i = 0; i < arr.length; i += 2) {
      obj[arr[i]] = arr[i + 1];
    }
    return obj;
  }

  header(k, v) {
    this._headers[k] = v;
    return this;
  }

  query(qs) {
    if (typeof qs !== 'object') {
      qs = this._toObject(Array.from(arguments));
    }
    this._queryStrings = qs;
    return this;
  }

  _createContext() {
    const req = {
      query: this._queryStrings,
      headers: this._headers
    };
    return {
      req,
      method: this._method,
      url: this._url
    };
  }

  _applyPluginStack(ctx, next) {
    const fn = compose(this._plugins);
    return fn(ctx, next);
  }

  _executeRequest() {
    const requestContext = this._createContext();
    return this._applyPluginStack(requestContext, handleHttpRequest)
      .then(() => {
        return requestContext;
      });
  }

  asBody() {
    return this.asResponse().then((res) => res.body);
  }

  asResponse() {
    return this._executeRequest()
      .then((ctx) => {
        return ctx.res;
      });
  }
}

module.exports = Blackadder;
