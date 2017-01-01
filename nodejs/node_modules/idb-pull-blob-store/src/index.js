'use strict'

const Dexie = require('dexie')
const write = require('pull-write')
const pushable = require('pull-pushable')
const toBuffer = require('typedarray-to-buffer')
const defer = require('pull-defer/sink')
const toWindow = require('pull-window').recent
const pull = require('pull-stream')

module.exports = class IdbBlobStore {
  constructor (dbname) {
    this.path = dbname || `pull-blob-store-${Math.random().toString().slice(2, 10)}`

    this.db = new Dexie(this.path)

    // Setup database
    this.db
      .version(1)
      .stores({
        [this.path]: '++,key,blob'
      })
  }

  get table () {
    return this.db[this.path]
  }

  write (key, cb) {
    cb = cb || (() => {})
    const d = defer()

    if (!key) {
      cb(new Error('Missing key'))

      return d
    }

    this.remove(key, (err) => {
      if (err) {
        return cb(err)
      }

      const table = this.table

      d.resolve(pull(
        toWindow(100, 10),
        write(writer, reduce, 100, cb)
      ))

      function writer (data, cb) {
        const blobs = data.map((blob) => ({
          key,
          blob
        }))

        table
          .bulkPut(blobs)
          .then(() => cb())
          .catch(cb)
      }

      function reduce (queue, data) {
        queue = queue || []
        if (!Array.isArray(data)) {
          data = [data]
        }

        data = data.map(ensureBuffer)

        if (!queue.length || last(queue).length > 99) {
          queue.push(Buffer.concat(data))
        } else {
          queue[lastIndex(queue)] = Buffer.concat(
            last(queue).concat(data)
          )
        }

        return queue
      }
    })

    return d
  }

  read (key) {
    const p = pushable()

    if (!key) {
      p.end(new Error('Missing key'))

      return p
    }

    this.exists(key, (err, exists) => {
      if (err) {
        return p.end(err)
      }

      if (!exists) {
        return p.end(new Error('Not found'))
      }

      this.table
        .where('key').equals(key)
        .each((val) => p.push(toBuffer(val.blob)))
        .catch((err) => p.end(err))
        .then(() => p.end())
    })

    return p
  }

  exists (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    this.table
      .where('key').equals(key)
      .count()
      .then((val) => cb(null, Boolean(val)))
      .catch(cb)
  }

  remove (key, cb) {
    cb = cb || (() => {})

    if (!key) {
      return cb(new Error('Missing key'))
    }

    const coll = this.table.where('key').equals(key)
    coll
      .count((count) => count > 0 ? coll.delete() : null)
      .then(() => cb())
      .catch(cb)
  }
}

function lastIndex (arr) {
  return arr.length - 1
}

function last (arr) {
  return arr[lastIndex(arr)]
}

function ensureBuffer (data) {
  return Buffer.isBuffer(data) ? data : Buffer.from(data)
}
