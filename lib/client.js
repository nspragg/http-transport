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
  if (_.isPlainObject(args[0])) {
    return args[0];
  }
  return toObject(args);
}

function isEmptyHeadersObject(args) {
  return (_.isPlainObject(args[0])) && Object.keys(args[0]).length === 0;
}

function rejectIfEmpty(args, message) {
  if (args.length == 0 || isEmptyHeadersObject(args)) throw new Error(message);
}

function validatePlugin(plugin) {
  if (typeof plugin !== 'function') throw new TypeError('Plugin is not a function');
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

  useGlobal(plugin) {
    validatePlugin(plugin);
    this._instancePlugins.push(plugin);
    return this;
  }

  use(plugin) {
    validatePlugin(plugin);
    this._ctx.addPlugin(plugin);
    return this;
  }

  get(url) {
    this._ctx.req
      .method('GET')
      .url(url);
    return this;
  }

  headers() {
    rejectIfEmpty(arguments, 'missing headers');

    const args = normalise(arguments);
    Object.keys(args).forEach((key) => {
      this._ctx.req.addHeader(key, args[key]);
    });
    return this;
  }

  query() {
    rejectIfEmpty(arguments, 'missing query strings');

    const args = normalise(arguments);
    Object.keys(args).forEach((key) => {
      this._ctx.req.addQuery(key, args[key]);
    });
    return this;
  }

  _getPlugins(ctx) {
    return this._instancePlugins.concat(ctx.plugins);
  }

  _applyPluginStack(ctx, next) {
    const fn = compose(this._getPlugins(ctx));
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
