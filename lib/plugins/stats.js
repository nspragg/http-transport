'use strict';

function createStatsName(statsName, feedName) {
    let name = statsName || 'http';
    if (feedName) {
        name += `.${feedName}`;
    }
    return name;
}

module.exports = (stats, statsName, feedName) => {
    const _stats = stats;
    return (ctx, next) => {
        return next().then(() => {
            _stats.increment(`${createStatsName(statsName, feedName)}.requests`);
        });
    };
};
