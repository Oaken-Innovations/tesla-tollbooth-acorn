'use strict'

const varint = require('varint')
const Reader = require('pull-reader')
const Buffer = require('safe-buffer').Buffer
const pushable = require('pull-pushable')

exports.decode = decode
exports.decodeFromReader = decodeFromReader

const MSB = 0x80
const isEndByte = (byte) => !(byte & MSB)

function decode (opts) {
  let reader = new Reader()
  let p = pushable((err) => {
    reader.abort(err)
  })

  return (read) => {
    reader(read)
    function next () {
      decodeFromReader(reader, opts, (err, msg) => {
        if (err) return p.end(err)

        p.push(msg)
        next()
      })
    }

    next()
    return p
  }
}

function decodeFromReader (reader, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = Object.assign({
    fixed: false,
    bytes: 4
  }, opts || {})

  if (opts.fixed) {
    readFixedMessage(reader, opts.bytes, cb)
  } else {
    readVarintMessage(reader, cb)
  }
}

function readFixedMessage (reader, byteLength, cb) {
  reader.read(byteLength, (err, bytes) => {
    if (err) {
      return cb(err)
    }

    const msgSize = bytes.readInt32BE(0)
    readMessage(reader, msgSize, cb)
  })
}

function readVarintMessage (reader, cb) {
  let rawMsgSize = []
  if (rawMsgSize.length === 0) readByte()

  // 1. Read the varint
  function readByte () {
    reader.read(1, (err, byte) => {
      if (err) {
        return cb(err)
      }

      rawMsgSize.push(byte)

      if (byte && !isEndByte(byte[0])) {
        readByte()
        return
      }

      const msgSize = varint.decode(Buffer.concat(rawMsgSize))
      readMessage(reader, msgSize, (err, msg) => {
        if (err) {
          return cb(err)
        }

        rawMsgSize = []

        cb(null, msg)
      })
    })
  }
}

function readMessage (reader, size, cb) {
  reader.read(size, (err, msg) => {
    if (err) {
      return cb(err)
    }

    cb(null, msg)
  })
}
