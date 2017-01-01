'use strict'

const tcp = require('net')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const libp2pSPDY = require('../src')

// const socket = tcp.connect(9999, '10.0.1.12')
const socket = tcp.connect(9999)

const muxer = libp2pSPDY.dialer(toPull(socket))

/*
muxer.on('stream', (stream) => {
  console.log('-> got new muxed stream')
  pull(
    stream,
    pull.log,
    stream
  )
})
*/

console.log('-> opening a stream from my side')
const stream = muxer.newStream((err) => {
  if (err) throw err
})

pull(
  pull.values(['hey, how is it going. I am dialer']),
  stream
)
