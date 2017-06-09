[![Build Status](https://travis-ci.org/nspragg/http-transport.svg)](https://travis-ci.org/nspragg/http-transport) [![Coverage Status](https://coveralls.io/repos/github/nspragg/http-transport/badge.svg?branch=master)](https://coveralls.io/github/nspragg/http-transport?branch=master)

# HttpTransport

> A flexible, modular REST client built for ease-of-use and resilience

## Installation

```
npm install --save http-transport
```

## Usage

```js
const url = 'http://example.com/';
const client = require('http-transport').createClient();

client
   .get(url)
   .asResponse()
   .then((res) => {
     if (res.statusCode === 200) {
       console.log(res.body);
     }
   });
});
```

## Documentation
For more examples and API details, see [API documentation](https://nspragg.github.io/http-transport/)

To generate a test coverage report:

```
npm run coverage
```
