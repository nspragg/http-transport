module.exports = (timeout) => {
  return (ctx, next) => {
    ctx.req.timeout(timeout);
    return next();
  };
};
