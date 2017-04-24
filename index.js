var Client = require('./lib/client');

module.exports.createClient = () => {
  return new Client();
};
