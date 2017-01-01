'use strict'

const path = require('path')
const write = require('pull-write-file')
const read = require('pull-file')
const fs = require('fs')
const mkdirp = require('mkdirp')
const defer = require('pull-defer/sink')
const pull = require('pull-stream')

module.exports = class FsBlobStore {
  constructor (dirname) {
    this.path = dirname
  }

  write (key, cb) {
    cb = cb || (() => {})

    const d = defer()

    if (!key) {
      cb(new Error('Missing key'))
      return d
    }

    const filename = join(this.path, key)
    mkdirp(path.dirname(filename), (err) => {
      if (err) {
        return cb(err)
      }

      d.resolve(write(filename, cb))
    })

    return d
  }

  read (key) {
    if (!key) {
      return pull.error(new Error('Missing key'))
    }

    return read(join(this.path, key))
  }

  exists (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    fs.stat(join(this.path, key), (err, stat) => {
      if (err && err.code !== 'ENOENT') {
        return cb(err)
      }
      cb(null, Boolean(stat))
    })
  }

  remove (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    fs.unlink(join(this.path, key), (err) => {
      if (err && err.code !== 'ENOENT') {
        return cb(err)
      }
      cb()
    })
  }
}

function join (root, dir) {
  return path.join(
    path.resolve(root),
    path.resolve('/', dir).replace(/^[a-zA-Z]:/, '')
  )
}
