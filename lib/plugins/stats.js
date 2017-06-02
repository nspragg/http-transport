module.exports = (stats) => {
    const _stats = stats || console;

    return (ctx, next) => {
        return next().then(() => {
            console.log(ctx.req);
            _stats.increment(`http.requests`);
        });
    };
};
