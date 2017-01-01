js-multibase
============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/multiformats/js-multibase/badge.svg?branch=master)](https://coveralls.io/github/multiformats/js-multibase?branch=master)
[![Travis CI](https://travis-ci.org/multiformats/js-multibase.svg?branch=master)](https://travis-ci.org/multiformats/js-multibase)
[![Circle CI](https://circleci.com/gh/multiformats/js-multibase.svg?style=svg)](https://circleci.com/gh/multiformats/js-multibase)
[![Dependency Status](https://david-dm.org/multiformats/js-multibase.svg?style=flat-square)](https://david-dm.org/multiformats/js-multibase)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> JavaScript Implementation of the [multibase](https://github.com/multiformats/multibase) specification

## Example

```JavaScript
const multibase = require('multibase')

const encodedBuf = multibase.encode('base58btc', new Buffer('hey, how is it going'))

const decodedBuf = multibase.decode(encodedBuf)
console.log(decodedBuf.toString())
// hey, how it going
```

## API

### `multibase` - Prefixes an encoded buffer with its multibase code

```
const multibased = multibase(<nameOrCode>, encodedBuf)
```

### `multibase.encode` - Encodes a buffer into one of the supported encodings, prefixing it with the multibase code

```JavaScript
const encodedBuf = multibase.encode(<nameOrCode>, <buf>)
```

### `multibase.decode` - Decodes a buffer or string

```JavaScript
const decodedBuf = multibase.decoded(bufOrString)
```

### `multibase.isEncoded` - Checks if buffer or string is encoded

```JavaScript
const value = multibase.isEncoded(bufOrString)
// value is the name of the encoding if it is encoded, false otherwise
```

### Supported Encodings, see [`src/constants.js`](/src/constants.js)

## Installation

### In Node.js through npm

```bash
> npm install --save multibase
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact an ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```js
const multibase = require('multiubase')
```


### In the Browser through `<script>` tag

Loading this module through a script tag will make the ```Multibase``` obj available in the global namespace.

```html
<script src="https://npmcdn.com/multibase/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/multibase/dist/index.js"></script>
```

#### Gotchas

You will need to use Node.js `Buffer` API compatible, if you are running inside the browser, you can access it by `multibase.Buffer` or you can load Feross's [Buffer](https://github.com/feross/buffer) module.


## License

[MIT] © Protocol Labs Inc.
