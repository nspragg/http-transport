const Client = require('./lib/client');
const DEFAULT_TRANSPORT = require('./lib/transport/request');
const Transport = require('./lib/transport/transport');
const Context = require('./lib/context');

module.exports.createClient = (httpTransport) => {
  return new Client(httpTransport || DEFAULT_TRANSPORT);
};

module.exports.transport = Transport;
module.exports.context = Context;
