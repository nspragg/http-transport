# HttpTransport

> A flexible, modular REST client built for ease-of-use and resilience

## Installation

```
npm install --save http-transport
```

## Features

* [Retries](#retries)
* [Timeout](#timeout)
* [Plugins](#plugins)
* [Http Transport](#transport)

## Usage

```js
const client = require('http-transport').createClient();

client
   .get(url)
   .qs('rights', rights)
   .asResponse()
   .then((res) => {
     handleResponse(res);
   });
});
```
