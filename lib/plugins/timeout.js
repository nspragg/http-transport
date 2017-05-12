module.exports = (timeout) => {
  return (ctx, next) => {
    ctx.timeout = timeout;
    return next();
  };
};
