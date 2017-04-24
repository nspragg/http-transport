module.exports = () => {
  return (ctx, next) => {
    ctx.res.body = JSON.parse(ctx.res.body);
  };
};
