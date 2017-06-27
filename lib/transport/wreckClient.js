'use strict';

const Url = require('url');
const promisifyAll = require('./promiseUtils').promisifyAll;
const Transport = require('./transport');
const Wreck = promisifyAll(require('wreck'), {
  multiArgs: true
});

function toAsyncMethod(method) {
  return `${method.toLowerCase()}Async`;
}

class WreckTranport extends Transport {
  toError(err) {
    const error = super.toError(err);
    error.headers = err.headers;
    error.statusCode = err.cause.output.statusCode;
    return error;
  }

  toOptions() {
    const req = this.ctx.req;
    const opts = {
      timeout: req.getTimeout(),
    };

    if (req.hasQueries()) {
      const url = Url.parse(req.getUrl(), true);
      const queries = url.query;
      url.query = Object.assign(queries, req.getQueries());
      this.ctx.req.url(Url.format(url));
    }

    if (req.hasHeaders()) opts.headers = req.getHeaders();
    const body = this.ctx.req.getBody();
    if (body) {
      if (typeof body === 'object') opts.json = true;
      opts.payload = body;
    }
    return opts;
  }

  makeRequest(opts) {
    const url = this.ctx.req.getUrl();
    const method = toAsyncMethod(this.ctx.req.getMethod());
    return Wreck[method](url, opts);
  }

  toResponse(ctx, from) {
    const res = from[0];
    let payload = from[1];
    if (typeof payload === 'string') {
      payload = payload.toString();
    }

    return {
      retries: ctx.res.retries,
      body: payload,
      elapsedTime: ctx.res.elapsedTime,
      statusCode: res.statusCode
    };
  }

  static createRequest(ctx) {
    return new WreckTranport(ctx);
  }
}

module.exports.createRequest = (ctx) => {
  return new WreckTranport(ctx);
};
