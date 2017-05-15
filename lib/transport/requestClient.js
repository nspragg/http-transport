const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));

const DEFAULT_TIMEOUT = 1000;

function fromContext(ctx) {
  const opts = {
    timeout: ctx.timeout || DEFAULT_TIMEOUT,
    time: true
  };
  if (ctx.req.query) {
    opts.qs = ctx.req.query;
  }
  if (ctx.req.headers) {
    opts.headers = ctx.req.headers;
  }
  return opts;
}

module.exports.createRequest = (ctx) => {
  const opts = fromContext(ctx);
  return () => {
    return Request.getAsync(ctx.url, opts)
      .catch((err) => {
        throw new Error(`Request failed for ${ctx.url} ${err.message}`);
      })
      .then((res) => ctx.res = res);
  }
}
