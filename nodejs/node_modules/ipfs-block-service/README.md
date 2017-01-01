# IPFS Block Service JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-block-service.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-block-service)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-block-service.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-block-service)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-block-service/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-block-service?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/ipfs-block-service.svg)](https://saucelabs.com/u/ipfs-block-service)

> [IPFS][ipfs] implementation of the BlockService and Block data structure in
> JavaScript.

**BlockService** - A BlockService is a content-addressable store for blocks,
providing an API for adding, deleting, and retrieving blocks. A BlockService is
backed by an [IPFS Repo][repo] as its datastore for blocks, and uses [Bitswap][bitswap] to fetch blocks from the network.

```markdown
┌────────────────────┐
│     BlockService   │
└────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌───────┐
│IPFS Repo│ |Bitswap│
└─────────┘ └───────┘
```

## Table of Contents

- [Install](#install)
  - [npm](#npm)
- [Usage](#usage)
  - [Node.js](#nodejs)
  - [Example](#example)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [Browser: `<script>` Tag](#browser-script-tag)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm i ipfs-block-service
```

## Usage

### Node.js

```js
const BlockService = require('ipfs-block-service')
```


### Example

```js
const BlockService = require('ipfs-block-service')
const Block = require('ipfs-block')
const IPFSRepo = require('ipfs-repo')  // storage repo
const Store = require('interface-pull-blob-store')  // in-memory store

// setup a repo
var repo = new IPFSRepo('example', { stores: Store })

// create a block
const block = new Block('hello world')
console.log(block.data)
console.log(block.key())

// create a service
const bs = new BlockService(repo)

// add the block, then retrieve it
bs.put({
  block: block,
  cid: cid,
}, function (err) {
  bs.get(cid, function (err, b) {
    console.log(block.data.toString() === b.data.toString())
  })
})
```

outputs

```
<Buffer 68 65 6c 6c 6f 20 77 61 72 6c 64>

<Buffer 12 20 db 3c 15 23 3f f3 84 8f 42 fe 3b 74 78 90 90 5a 80 7e a6 ef 2b 6d 2f 3c 8b 2c b7 ae be 86 3c 4d>

true

```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```JavaScript
var BlockService = require('ipfs-block-service')
```

### Browser: `<script>` Tag

Loading this module through a script tag will make the `IpfsBlockService` obj available in
the global namespace.

```html
<script src="https://unpkg.com/ipfs-block-service/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-block-service/dist/index.js"></script>
```

# API

```js
const BlockService = require('ipfs-block-service')
```

### `new BlockService(repo)`

- `repo: Repo`

Creates a new block service backed by [IPFS Repo][repo] `repo` for storage.

### `goOnline(bitswap)`

- `bitswap: Bitswap`

Add a bitswap instance that communicates with the network to retreive blocks
that are not in the local store.

If the node is online all requests for blocks first check locally and
afterwards ask the network for the blocks.

### `goOffline()`

Remove the bitswap instance and fall back to offline mode.

### `isOnline()`

Returns a `Boolean` indicating if the block service is online or not.

### `put(blockAndCID, callback)`

- `blockAndCID: { block: block, cid: cid }`
- `callback: Function`

Asynchronously adds a block instance to the underlying repo.

### `putStream()`

Returns a through pull-stream, which `blockAndCID`s can be written to, and
that emits the meta data about the written block.

### `get(cid [, extension], callback)`

- `cid: CID`
- `extension: String`, defaults to 'data'
- `callback: Function`

Asynchronously returns the block whose content multihash matches `multihash`.

### `getStream(cid [, extension])`

- `cid: CID`
- `extension: String`, defaults to 'data'

Returns a source pull-stream, which emits the requested block.

### `delete(cids, [, extension], callback)`

- `cids: CID | []CID`
- `extension: String`, defaults to 'data' - `extension: String`, defaults to 'data'
- `callback: Function`

Deletes all blocks referenced by multihashes.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-block-service/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)

[ipfs]: https://ipfs.io
[bitswap]: https://github.com/ipfs/specs/tree/master/bitswap
[repo]: https://github.com/ipfs/specs/tree/master/repo


