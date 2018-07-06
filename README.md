# @neoskop/phantom

> An AOP (aspect oriented programming) framework

Master
[![Travis master][travis-master-image]][travis-master-url]
[![Test coverage master][coveralls-master-image]][coveralls-master-url]
[![Known Vulnerabilities master][snyk-master-image]][snyk-master-url]

Develop
[![Travis develop][travis-develop-image]][travis-develop-url]
[![Test coverage develop][coveralls-develop-image]][coveralls-develop-url]
[![Known Vulnerabilities develop][snyk-develop-image]][snyk-develop-url]

## Installation

```sh
yarn add @neoskop/phantom
```

## Usage

```typescript
import { AopManager, Before, After, JoinpointContext } from '@neoskop/phantom';

class TestClass {
    foo(arg : string) {
        return arg.toUpperCase();
    }
    bar(arg : string) {
        return arg.toLowerCase()
    }
}

class LoggerAspect {
    @Before(TestClass, /./)
    beforeEach(jp : JoinpointContext) {
        console.log('> TestClass', jp.getProperty(), jp.getArguments());
    }
    
    @After(TestClass, /./)
    afterEach(jp : JoinpointContext) {
        console.log('< TestClass', jp.getProperty(), jp.getResult());
    }
}

const manager = new AopManager();
manager.install([ new LoggerAspect() ]);

const instance = new TestClass();

console.log(instance.foo('Foo')); // > TestClass foo [ 'Foo' ]
                                  // < TestClass foo FOO
                                  // FOO
                                     
console.log(instance.bar('Bar')); // > TestClass bar [ 'Bar' ]
                                  // < TestClass bar bar
                                  // bar
```

## Testing

```sh
yarn test
```

## Building

```sh
yarn run build
```

## License

MIT License

Copyright (c) 2018 Neoskop GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## Sponsor

[![Neoskop GmbH][neoskop-image]][neoskop-url]

[travis-master-image]: https://img.shields.io/travis/neoskop/phantom/master.svg
[travis-master-url]: https://travis-ci.org/neoskop/phantom
[travis-develop-image]: https://img.shields.io/travis/neoskop/phantom/develop.svg
[travis-develop-url]: https://travis-ci.org/neoskop/phantom
[snyk-master-image]: https://snyk.io/test/github/neoskop/phantom/master/badge.svg
[snyk-master-url]: https://snyk.io/test/github/neoskop/phantom/master

[coveralls-master-image]: https://coveralls.io/repos/github/neoskop/phantom/badge.svg?branch=master
[coveralls-master-url]: https://coveralls.io/github/neoskop/phantom?branch=master
[coveralls-develop-image]: https://coveralls.io/repos/github/neoskop/phantom/badge.svg?branch=develop
[coveralls-develop-url]: https://coveralls.io/github/neoskop/phantom?branch=develop
[snyk-develop-image]: https://snyk.io/test/github/neoskop/phantom/develop/badge.svg
[snyk-develop-url]: https://snyk.io/test/github/neoskop/phantom/develop

[neoskop-image]: ./neoskop.png
[neoskop-url]: https://www.neoskop.de/

