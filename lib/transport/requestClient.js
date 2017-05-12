const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));

function fromContext(ctx) {
  const opts = {};
  opts.timeout = ctx.timeout;
  const req = ctx.req;
  if (req.query) {
    opts.qs = req.query;
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
