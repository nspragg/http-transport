# Blackadder

> A flexible, modular REST client built for ease-of-use and resilience

## Installation

```
npm install --save blackadder
```

## Features

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
