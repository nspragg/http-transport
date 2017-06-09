# HttpTranport

[![Build Status](https://travis-ci.org/nspragg/http-transport.svg)](https://travis-ci.org/nspragg/http-transport) [![Coverage Status](https://coveralls.io/repos/github/nspragg/http-transport/badge.svg?branch=master)](https://coveralls.io/github/nspragg/http-transport?branch=master)

> A flexible rest client that can be easy extended using plugins

## Common examples

The example below prints all of the files in a directory that have the `.json` file extension:

```js
const httpTransport = require('http-transport');


```

#### Supported HTTP methods

Make a HTTP GET request using `.get`

```js
    const url = 'http://example.com/';
    HttpTransport.createClient()
        .get(url)
        .asResponse()
        .then((res) => {
          console.log(res);
        });
```

Make a HTTP POST request using `.post`

```js
   const url = 'http://example.com/';
   HttpTransport.createClient()
        .post(url, requestBody)
        .asResponse()
        .then((res) => {
          console.log(res);
        });
```

#### Query strings

Make a HTTP GET request specifiying query strings using `.query`

```js
    const url = 'http://example.com/';
    HttpTransport.createClient()
        .get(url)
        .query('example', 'true')
        .asResponse()
        .then((res) => {
          console.log(res);
        });
```

#### Headers

Make a HTTP GET request specifiying request headers using `.headers`

```js
    HttpTransport.createClient()
        .get(url)
        .headers({
          'someHeader1' : 'someValue1'
          'someHeader2' : 'someValue2'
        })
        .asResponse()
        .then((res) => {
            console.log(res);
        });
```

#### Handling errors

Convert `Internal Server` responses (500) to errors:

```js
    const toError = require('http-transport-errors');

    const url = 'http://example.com/';
    const client = HttpTransport.createClient();
    client.useGlobal(toError()); // for all requests

    client.get(url)
        .asResponse()
        .catch((err) => {
          console.error(err);
        });
```

#### Retries

Make a HTTP GET request specifiying request headers using `.query`

```js

```

#### Timeouts

Make a HTTP GET request specifiying request headers using `.query`

```js

```

#### Using alternative HTTP clients

Make a HTTP GET request specifiying request headers using `.query`

```js

```

#### Offical plugins
See [Stats](https://github.com/nspragg/stats)
See [Caching](https://github.com/nspragg/caching)
See [Errors](https://github.com/nspragg/errors)
See [Logging](https://github.com/nspragg/logger)
See [Circuit-breaker](https://github.com/nspragg/breaker)
