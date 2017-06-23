'use strict';

const http = require('http');
const request = require('request');
const Flashheart = require('flashheart');
const HttpTransport = require('./index');
const bluebird = require('bluebird');

const server = http.createServer((req, res) => {
  res.write(req.url.slice(1) + '\n');
  setTimeout(res.end.bind(res), 3000);
});

const REQUEST = 1;
const FLASHHEART = 2;
const HTTP_TRANSPORT = 3;

const t = HttpTransport.createClient();

function getClient(type) {
  switch (type) {
    case REQUEST:
      return bluebird.promisifyAll(request);
    case FLASHHEART:
      return bluebird.promisifyAll(Flashheart.createClient({
        timeout: 5
      }));
    case HTTP_TRANSPORT:
      return {
        getAsync: (url) => {
          return t.get(url).asResponse();
        }
      };
    default:
      throw new Error('client type expected');
  }
}

const client = getClient(REQUEST);

server.listen(7082, () => {
  let pending = 20;
  for (let i = 0; i < 20; i++) {
    client.getAsync('http://localhost:7082/' + i)
      .catch(console.error)
      .then(() => {
        if (--pending === 0) server.close();
      });
  }
});
process.stdout.setMaxListeners(0);
