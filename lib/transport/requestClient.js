const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));

function toOptions(ctx) {
  const opts = {
    timeout: ctx.getTimeout(),
    time: true
  };
  if (ctx.hasQueries()) {
    opts.qs = ctx.getQueries();
  }
  if (ctx.hasHeaders()) {
    opts.headers = ctx.getHeaders();
  }
  return opts;
}

function toResponse(res) {
  return res; // TODO
}

function onError(ctx) {
  return (err) => {
    throw new Error(`Request failed for ${ctx.getUrl()} ${err.message}`);
  };
}

module.exports.createRequest = (ctx) => {
  return () => {
    const url = ctx.getUrl();
    const opts = toOptions(ctx);

    return Request.getAsync(url, opts)
      .catch(onError(ctx))
      .then((res) => {
        ctx.res = toResponse(res)
      });
  }
};
