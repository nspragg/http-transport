'use strict';

function createStatsName(statsName, feedName) {
  let name = statsName || 'http';
  if (feedName) {
    name += `.${feedName}`;
  }
  return name;
}

module.exports = (stats, statsName, feedName) => {
  return (ctx, next) => {
    return next().then(() => {
      console.log(ctx);
      stats.timing(`${createStatsName(statsName, feedName)}.attempts`);
    });
  };
};
