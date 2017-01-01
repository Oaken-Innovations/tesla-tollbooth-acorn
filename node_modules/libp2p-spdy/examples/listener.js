'use strict'

const tcp = require('net')
const pull = require('pull-stream')
const toPull = require('stream-to-pull-stream')
const libp2pSPDY = require('../src')

const listener = tcp.createServer((socket) => {
  console.log('-> got connection')

  const muxer = libp2pSPDY.listener(toPull(socket))

  muxer.on('stream', (stream) => {
    console.log('INCOMMING MUXED STREAM')
    pull(
      stream,
      pull.drain((data) => {
        console.log('DO I GET DATA?', data)
      })
    )
  })

  /*
  console.log('-> opening a stream from my side')
  const stream = muxer.newStream((err) => {
    if (err) throw err
    console.log('-> opened the stream')
  })

  pull(
    pull.values(['hey, how is it going']),
    stream
  )
  */
})

listener.listen(9999, () => {
  console.log('-> listening on 9999')
})
