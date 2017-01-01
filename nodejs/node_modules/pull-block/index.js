'use strict'

var through = require('pull-through')

module.exports = function block (size, opts) {
  if (!opts) opts = {}
  if (typeof size === 'object') {
    opts = size
    size = opts.size
  }
  size = size || 512

  var zeroPadding

  if (opts.nopad) {
    zeroPadding = false
  } else {
    zeroPadding = typeof opts.zeroPadding !== 'undefined' ? opts.zeroPadding : true
  }

  var buffered = []
  var bufferedBytes = 0

  return through(function transform (data) {
    if (typeof data === 'number') {
      data = Buffer([data])
    }
    bufferedBytes += data.length
    buffered.push(data)

    while (bufferedBytes >= size) {
      var b = Buffer.concat(buffered)
      bufferedBytes -= size
      this.queue(b.slice(0, size))
      buffered = [ b.slice(size, b.length) ]
    }
  }, function flush (end) {
    if (bufferedBytes && zeroPadding) {
      var zeroes = new Buffer(size - bufferedBytes)
      zeroes.fill(0)
      buffered.push(zeroes)
      this.queue(Buffer.concat(buffered))
      buffered = null
    } else if (bufferedBytes && buffered) {
      this.queue(Buffer.concat(buffered))
      buffered = null
    }

    this.queue(null)
  })
}
