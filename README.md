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
## Contributing

* If you're unsure if a feature would make a good addition, you can always [create an issue](https://github.com/nspragg/http-transport/issues/new) first.
* We aim for 100% test coverage. Please write tests for any new functionality or changes.
* Any API changes should be fully documented.
* Make sure your code meets our linting standards. Run `npm run lint` to check your code.
* Maintain the existing coding style. There are some settings in `.jsbeautifyrc` to help.
* Be mindful of others when making suggestions and/or code reviewing.
