# proof-of-work
[![Build Status](https://secure.travis-ci.org/indutny/proof-of-work.png)](http://travis-ci.org/indutny/proof-of-work)
[![NPM version](https://badge.fury.io/js/proof-of-work.svg)](http://badge.fury.io/js/proof-of-work)

Proof of work based on SHA256 and Bloom filter.

## Usage

Solver:
```js
const pow = require('proof-of-work');

const solver = new pow.Solver();

// complexity=13
const nonce = solver.solve(13);
console.log(nonce);
```

Verifier:
```js
const pow = require('proof-of-work');

const verifier = new pow.Verifier({
  // bit-size of Bloom filter
  size: 1024,

  // number of hash functions in a Bloom filter
  n: 16,

  // target complexity
  complexity: 13
});

// Remove staled nonces from Bloom filter
setInterval(() => {
  verifier.reset();
}, 300000);

verifier.verify(nonce);
```

## CLI

```bash
$ npm install -g proof-of-work

$ proof-of-work -h
Usage: proof-of-work <complexity>                 - generate nonce
       proof-of-work verify <complexity> (nonce)? - verify nonce

$ proof-of-work 13
2808fde24c9104d97f58a604cafa6e8db6661f44b4caf9dc311cbb8140648447

$ proof-of-work verify 13 \
    2808fde24c9104d97f58a604cafa6e8db6661f44b4caf9dc311cbb8140648447 && \
    echo success
success

$ proof-of-work 13 | proof-of-work verify 13 && echo success
success

$ proof-of-work 0 | proof-of-work verify 32 || echo failure
failure
```

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2016.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
