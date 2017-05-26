module.exports = (timeout) => {
  return (ctx, next) => {
    ctx.setTimeout(timeout);
    return next();
  };
};
