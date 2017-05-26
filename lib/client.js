'use strict';

const _ = require('lodash');
const compose = require('koa-compose');
const Promise = require('bluebird');
const httpRequestFactory = require('./transport/requestClient');
const context = require('./context');
const packageInfo = require('../package');

function handleHttpRequest(ctx, next) {
  const httpRequest = httpRequestFactory.createRequest(ctx);
  return httpRequest()
    .then(() => {
      next()
    });
}

function toObject(arr) {
  const obj = {};
  for (let i = 0; i < arr.length; i += 2) {
    obj[arr[i]] = arr[i + 1];
  }
  return obj;
}

function normalise(args) {
  args = Array.from(args);
  if (args.length > 0 && _.isPlainObject(args[0])) {
    return args[0];
  }
  return toObject(args);
}

function isEmptyHeadersObject(args) {
  return (args.length > 0 && _.isPlainObject(args[0])) && Object.keys(args[0]).length === 0;
}

class Blackadder {
  constructor() {
    this._ctx = context.create();
    this._instancePlugins = [];
    this._defaultHeaders = {
      'User-Agent': `${packageInfo.name}/${packageInfo.version}`
    }
    this.headers(this._defaultHeaders);
  }

  use(plugin) {
    this._ctx.addPlugin(plugin);
    return this;
  }

  get(url, plugin) {
    if (plugin) {
      this._ctx.addPlugin(plugin);
    }
    this._ctx.setMethod('GET').setUrl(url);
    return this;
  }

  headers() {
    if (arguments.length == 0) throw new Error('missing headers');
    if (isEmptyHeadersObject(arguments)) throw new Error('empty headers object');

    const args = normalise(arguments);
    Object.keys(args).forEach((key) => {
      this._ctx.addHeader(key, args[key]);
    });
    return this;
  }

  query() {
    const args = normalise(arguments);
    Object.keys(args).forEach((key) => {
      this._ctx.addQuery(key, args[key]);
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
