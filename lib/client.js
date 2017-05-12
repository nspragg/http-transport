'use strict';

const compose = require('koa-compose');

const httpRequestFactory = require('./transport/requestClient');

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

  query(k, v) {
    if (typeof k === 'object') {
      Object.assign(this._queryStrings, k);
      return this;
    }
    this._queryStrings[k] = v;
    return this;
  }

  _applyPluginStack(ctx, next) {
    const fn = compose(this._plugins);
    return fn(ctx, next);
  }

  _createContext() {
    const req = {};
    const context = {
      req
    };
    context.url = this._url;
    req.query = this._queryStrings;
    return context;
  }

  _executeRequest() {
    const context = this._createContext();

    const requestStack = this._applyPluginStack(context, (ctx, next) => {
      const httpRequest = httpRequestFactory.createRequest(ctx);
      return httpRequest().then(() => next())
    });
    return requestStack.then(() => context);
  }

  asBody() {
    return this._executeRequest()
      .then((ctx) => {
        return ctx.res.body;
      });
  }
}

module.exports = Blackadder;
