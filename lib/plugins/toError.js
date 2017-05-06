function createResponseError(url, res) {
  const error = new Error(`Received HTTP code ${res.statusCode} for GET ${url}`);
  error.statusCode = res.statusCode;
  error.headers = res.headers;
  return error;
}

module.exports = () => {
  return (ctx, next) => {
    return next()
      .then(() => {
        const res = ctx.res;
        if (res.statusCode != 200) {
          throw createResponseError(ctx.url, res);
        }
      });
  };
};
