'use strict';

const _ = require('lodash');
const compose = require('koa-compose');
const httpRequestFactory = require('./transport/requestClient');
const context = require('./context');
const packageInfo = require('../package');

function handleHttpRequest(ctx, next) {
  const httpRequest = httpRequestFactory.createRequest(ctx);
  return httpRequest()
    .then(() => {
      next();
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
  if (args.length === 0 || isEmptyHeadersObject(args)) throw new Error(message);
}

function validatePlugin(plugin) {
  if (typeof plugin !== 'function') throw new TypeError('Plugin is not a function');
}

function toRetry(err) {
  return {
    reason: err.message,
    statusCode: err.statusCode
  };
}

function retry(fn, times) {
  const calls = [];
  let promise = fn();
  for (let i = 0; i < times; i++) {
    promise = promise.catch((err) => {
      calls.push(toRetry(err));
      return fn();
    });
  }
  return promise
    .then((ctx) => {
      ctx.res.retries = calls;
      return ctx;
    });
}

class Blackadder {
  constructor() {
    this._ctx = context.create();
    this._instancePlugins = [];
    this._defaultHeaders = {
      'User-Agent': `${packageInfo.name}/${packageInfo.version}`
    };
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

  post(url, body) {
    this._ctx.req
      .method('POST')
      .body(body)
      .url(url);
    return this;
  }

  put(url, body) {
    this._ctx.req
      .method('PUT')
      .body(body)
      .url(url);
    return this;
  }

  delete(url, body) {
    this._ctx.req
      .method('DELETE')
      .body(body)
      .url(url);
    return this;
  }

  patch(url, body) {
    this._ctx.req
      .method('PATCH')
      .body(body)
      .url(url);
    return this;
  }

  head(url) {
    this._ctx.req
      .method('HEAD')
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

  timeout(secs) {
    this._ctx.req.timeout(secs);
    return this;
  }

  retry(retries) {
    this._retries = retries;
    return this;
  }

  asBody() {
    return this.asResponse().then((res) => res.body);
  }

  asResponse() {
    const requestContext = this._ctx;
    this._ctx = context.create();

    const request = this._executeRequest.bind(this, requestContext);
    return retry(request, this._retries).then((ctx) => ctx.res);
  }

  _getPlugins(ctx) {
    return this._instancePlugins.concat(ctx.plugins);
  }

  _applyPluginStack(ctx, next) {
    const fn = compose(this._getPlugins(ctx));
    return fn(ctx, next);
  }

  _executeRequest(ctx) {
    return this._applyPluginStack(ctx, handleHttpRequest).then(() => ctx);
  }
}

module.exports = Blackadder;
