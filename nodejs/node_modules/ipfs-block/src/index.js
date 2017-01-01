'use strict'

const multihashing = require('multihashing-async')
const setImmediate = require('async/setImmediate')

module.exports = Block

// Immutable block of data
function Block (data) {
  if (!(this instanceof Block)) {
    return new Block(data)
  }

  if (!data) {
    throw new Error('Block must be constructed with data')
  }

  this._cache = {}

  data = ensureBuffer(data)

  Object.defineProperty(this, 'data', {
    get () {
      return data
    },
    set () {
      throw new Error('Tried to change an immutable block')
    }
  })

  this.key = (hashFunc, callback) => {
    if (typeof hashFunc === 'function') {
      callback = hashFunc
      hashFunc = null
    }

    if (!hashFunc) {
      hashFunc = 'sha2-256'
    }

    if (this._cache[hashFunc]) {
      return setImmediate(() => {
        callback(null, this._cache[hashFunc])
      })
    }

    multihashing(this.data, hashFunc, (err, multihash) => {
      if (err) {
        return callback(err)
      }
      this._cache[hashFunc] = multihash
      callback(null, multihash)
    })
  }
}

function ensureBuffer (data) {
  if (Buffer.isBuffer(data)) {
    return data
  }

  return new Buffer(data)
}
