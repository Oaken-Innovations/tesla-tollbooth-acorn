'use strict'

const createWrite = require('pull-write')
const pull = require('pull-stream')

module.exports = class MemoryBlobStore {
  constructor () {
    this.store = {}
  }

  write (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    this.store[key] = new Buffer([])

    return createWrite((data, cb) => {
      this.store[key] = Buffer.concat(
        [this.store[key]].concat(data)
      )
      cb()
    }, null, 100, cb)
  }

  read (key) {
    if (!key) {
      return pull.error(new Error('Missing key'))
    }

    const place = this.store[key]
    if (place) {
      return pull.values([this.store[key]])
    }

    return pull.error(new Error(`Unkown key ${key}`))
  }

  exists (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    cb(null, Boolean(this.store[key]))
  }

  remove (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    delete this.store[key]
    cb()
  }
}
