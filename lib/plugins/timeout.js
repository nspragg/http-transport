module.exports = (timeout) => {
  return (ctx, next) => {
    ctx.req.setTimeout(timeout);
    return next();
  };
};
