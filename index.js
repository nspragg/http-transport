const Client = require('./lib/client');
const DEFAULT_REQUEST_FACTORY = require('./lib/transport/requestClient');

module.exports.createClient = (httpRequestFactory) => {
  return new Client(httpRequestFactory || DEFAULT_REQUEST_FACTORY);
};
