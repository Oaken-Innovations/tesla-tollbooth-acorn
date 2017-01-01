'use strict'

const spdy = require('spdy-transport')
const toStream = require('pull-stream-to-stream')

const Muxer = require('./muxer')
const SPDY_CODEC = require('./spdy-codec')

function create (rawConn, isListener) {
  const conn = toStream(rawConn)
  // Let it flow, let it flooow
  conn.resume()

  conn.on('end', () => {
    // Cleanup and destroy the connection when it ends
    // as the converted stream doesn't emit 'close'
    // but .destroy will trigger a 'close' event.
    conn.destroy()
  })

  const spdyMuxer = spdy.connection.create(conn, {
    protocol: 'spdy',
    isServer: isListener
  })

  return new Muxer(rawConn, spdyMuxer)
}

exports = module.exports = create
exports.multicodec = SPDY_CODEC
exports.dialer = (conn) => create(conn, false)
exports.listener = (conn) => create(conn, true)
