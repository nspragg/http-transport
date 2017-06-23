'use strict';

const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));
const Transport = require('./transport');

const REQUIRED_PROPERTIES = [
  'body',
  'elapsedTime',
  'url',
  'statusCode',
  'headers'
];

function toAsyncMethod(method) {
  return `${method.toLowerCase()}Async`;
}

class RequestFactory extends Transport {
  toError(err, ctx) {
    throw new Error(`Request failed for ${ctx.req.getMethod()} ${ctx.req.getUrl()}: ${err.message}`);
  }

  toOptions() {
    const req = this.ctx.req;
    const opts = {
      timeout: req.getTimeout(),
      time: true
    };
    if (req.hasQueries()) opts.qs = req.getQueries();
    if (req.hasHeaders()) opts.headers = req.getHeaders();
    const body = this.ctx.req.getBody();
    if (body) {
      if (typeof body === 'object') opts.json = true;
      opts.body = body;
    }
    return opts;
  }

  toResponse(ctx, res) {
    const to = ctx.res;
    REQUIRED_PROPERTIES.forEach((property) => {
      to[property] = res[property];
    });
    return to;
  }

  makeRequest(opts) {
    const url = this.ctx.req.getUrl();
    const method = this.ctx.req.getMethod();
    return Request[toAsyncMethod(method)](url, opts);
  }
}

module.exports.createRequest = (ctx) => {
  return new RequestFactory(ctx);
};
