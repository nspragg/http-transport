# Blackadder

> A flexible, modular REST client built for ease-of-use and resilience

## Installation

```
npm install --save blackadder
```

## Features

* [Async](#asynchronicity)
* [Retries](#retries)
* [Timeout](#timeout)
* [Plugins](#plugins)
* [Http Transport](#transport)

## Usage

```js
const client = require('blackadder').createClient();

client
   .get(url)
   .qs('rights', rights)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
});
```

### Timeout

```js
client
   .get(url)
   .timeout(10)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
```

### Retries

By default the client retries failed requests once, with a delay of 100 milliseconds between attempts. The number of times to retry and the delay between retries can be configured using the `retries` and `retryTimeout` properties.

Default retries can be overridden using method options:

```js
client
   .get(url)
   .retries(10)
   .retryTimeout(500)
   .then((json) => {
     handleResponse(json);
   });
```

Only request errors or server errors result in a retry; `4XX` errors are _not_ retried.

## Plugins

Supported plugins:

* [Parses JSON responses](#json)
* [Understands HTTP errors](#errors)
* [Rate Limiting](#rate-limiting)
* [Caching](#caching)
* [Logging](#logging)
* [StatsD integration](#stats)
* [Circuit breaker](#circuit-breaker)

### JSON

The client assumes you're working with a JSON API by default. It uses the `json: true` option in request to send the `Accept: application/json` header and automatically parse the response into an object. If you need to call an API that returns plain text, XML, animated GIFs etc. then set the `json` flag to `false` in your request options.

```js
client
   .use(asJson())
   .get(url)
   .asBody()
   .then((json) => {
     handleResponse(json);
   });
```

### Errors

Unlike `request`, any response with a status code greater than or equal to `400` results in an error. There's no need to manually check the status code of the response. The status code is exposed as `err.statusCode` on the returned error object, the body (if one exists) is assigned to `err.body` and the headers are assigned to `err.headers`.

```js
client
   .use(errorHandler())
   .get(url)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
```

### Rate Limiting

The client has no rate limitation by default. You can specify how many requests are allowed to happen within a given interval — respectively with the `rateLimitLimit` and `rateLimitInterval` properties.

```js
client
   .use(ratelimit(rateLimitLimit, rateLimitInterval))
   .get(url)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
```

*Note*: rate limiting is provided by [simple-rate-limiter](https://www.npmjs.com/package/simple-rate-limiter).

### Caching

The client will optionally cache any publicly cacheable response with a `max-age` directive. You can specify the caching storage with an instance of [Catbox](https://github.com/hapijs/catbox) using the `cache` parameter.

```js
const Catbox = require('catbox').Client;
const Memory = require('catbox-memory');
const storage = new Catbox(new Memory());
const client = require('blackadder').createClient({
  cache: storage
});
```

The cache varies on _all_ request options (and therefore, headers) by default. If you don't want to vary on a particular header, use the `doNotVary` option:

```js
const client = require('blackadder');
const responseCache = require('blackadder-cache');

client
  .use(responseCache)
  .createClient();
```

### Logging

All requests can be logged at `info` level if you provide a logger that supports the standard logging API (like `console` or [Winston](https://github.com/flatiron/winston))

```js
client
   .use(logger(config))
   .get(url)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
```

### Stats

Metrics can be sent to [StatsD](https://github.com/etsy/statsd/) by providing an instance of the [node-statsd](https://github.com/sivy/node-statsd) client:

```js
const statsD = require('blackadder-statsD');

client
   .use(statsD(config))
   .get(url)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
```

The following metrics are sent from each client:

|Name|Type|Description|
|----|----|-----------|
|`{name}.requests`|Counter|Incremented every time a request is made|
|`{name}.responses.{code}`|Counter|Incremented every time a response is received|
|`{name}.request_errors`|Counter|Incremented every time a request fails (timeout, DNS lookup fails etc.)|
|`{name}.response_time`|Timer|Measures of the response time in milliseconds across all requests|
|`{name}.cache.hits`|Counter|Incremented for each cache hit|
|`{name}.cache.misses`|Counter|Incremented for each cache miss|
|`{name}.cache.errors`|Counter|Incremented whenever there's is a problem communicating with the cache|

The `{name}` variable comes from the `name` option you pass to `createClient`. It defaults to `http` if you don't name your client.

You can also add the `name` option on a per-request basis which will include the request name in the metric. For example: `api.feed.cache.hits`.

### Circuit breaker

By default the client implements a circuit breaker using the [Levee](https://github.com/totherik/levee) library. It is configured to trip after 100 failures and resets after 10 seconds. This can be configured using the `circuitBreakerMaxFailures` and `circuitBreakerResetTimeout` properties.

For example to trip after 200 failures and try to reset after 30 seconds:

```js
const client = Flashheart
   .use(circuitBreaker(circuitBreakerMaxFailures, circuitBreakerResetTimeout))
   .createClient();

client
  .get(url)
  .asResponse()
  .then((res) => {
     handleResponse(res);    
  });
```
