const Client = require('./lib/client');
const DEFAULT_TRANSPORT = require('./lib/transport/request');

module.exports.createClient = (httpTransport) => {
  return new Client(httpTransport || DEFAULT_TRANSPORT);
};
