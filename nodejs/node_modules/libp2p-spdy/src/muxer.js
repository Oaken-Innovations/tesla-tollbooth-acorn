'use strict'

const EventEmitter = require('events').EventEmitter
const noop = require('lodash.noop')
const Connection = require('interface-connection').Connection
const toPull = require('stream-to-pull-stream')

const SPDY_CODEC = require('./spdy-codec')

module.exports = class Muxer extends EventEmitter {
  constructor (conn, spdy) {
    super()

    this.spdy = spdy
    this.conn = conn
    this.multicodec = SPDY_CODEC

    spdy.start(3.1)

    // The rest of the API comes by default with SPDY
    spdy.on('close', () => {
      this.emit('close')
    })

    spdy.on('error', (err) => {
      this.emit('error', err)
    })

    // needed by other spdy impl that need the response headers
    // in order to confirm the stream can be open
    spdy.on('stream', (stream) => {
      stream.respond(200, {})
      const muxedConn = new Connection(toPull.duplex(stream), this.conn)
      this.emit('stream', muxedConn)
    })
  }

  // method added to enable pure stream muxer feeling
  newStream (callback) {
    if (!callback) {
      callback = noop
    }
    const conn = new Connection(null, this.conn)

    this.spdy.request({
      method: 'POST',
      path: '/',
      headers: {}
    }, (err, stream) => {
      conn.setInnerConn(toPull.duplex(stream), this.conn)
      callback(err, conn)
    })

    return conn
  }

  end (cb) {
    this.spdy.end(cb)
  }
}
