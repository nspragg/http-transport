'use strict';

const promisifyAll = require('./promiseUtils').promisifyAll;
const Transport = require('./transport');
const Request = promisifyAll(require('request'));

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

class RequestTransport extends Transport {
  constructor(ctx) {
    super(ctx);
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

  toResponse(ctx, from) {
    const to = ctx.res;
    REQUIRED_PROPERTIES.forEach((property) => {
      to[property] = from[property];
    });
    return to;
  }

  makeRequest(opts) {
    const url = this.ctx.req.getUrl();
    const method = this.ctx.req.getMethod();
    return Request[toAsyncMethod(method)](url, opts);
  }

  static createRequest(ctx) {
    return new RequestTransport(ctx);
  }
}

module.exports = RequestTransport;
