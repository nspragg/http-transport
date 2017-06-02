const Promise = require('bluebird');
const Request = Promise.promisifyAll(require('request'));

const REQUIRED_PROPERTIES = [
  'body',
  'elapsedTime',
  'url',
  'statusCode',
  'headers'
];

function toOptions(ctx) {
  const req = ctx.req;
  const opts = {
    timeout: req.getTimeout(),
    time: true
  };
  if (req.hasQueries()) {
    opts.qs = req.getQueries();
  }
  if (req.hasHeaders()) {
    opts.headers = req.getHeaders();
  }
  return opts;
}

function toResponse(ctx, from) {
  const to = ctx.res;
  REQUIRED_PROPERTIES.forEach((property) => {
    to[property] = from[property];
  });
  return to;
}

function onError(ctx) {
  return (err) => {
    throw new Error(`Request failed for ${ctx.req.getUrl()} ${err.message}`);
  };
}

module.exports.createRequest = (ctx) => {
  return () => {
    const url = ctx.req.getUrl();
    const opts = toOptions(ctx);

    return Request.getAsync(url, opts)
      .catch(onError(ctx))
      .then((res) => {
        ctx.res = toResponse(ctx, res)
      });
  }
};
