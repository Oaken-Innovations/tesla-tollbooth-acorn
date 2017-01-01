'use strict'
var fs = require('fs')
var crypto = require('crypto')
var Stats = require('statistics')
var osenv = require('osenv')
var path = require('path')
var pull = require('pull-stream')
var Stringify = require('pull-stringify')

var tmpfile = path.join(osenv.tmpdir(), 'bench_pull-write-file_write-latency')
// sample the time to write various size buffers from 1 byte to 1 megabyte
// null hypothesis: the response is linear.
try { fs.truncate(tmpfile) }
catch (err) { console.error('error truncate:', err) }

var fd = fs.openSync(tmpfile, 'a') //open in append mode.

//okay, lets see how many writes we can do in 1 second,
//starting from 1 byte, and doubling that.
var MB = Math.pow(2, 20)
var N = 29
var bytes = crypto.pseudoRandomBytes(Math.pow(2, N))

function bench (n, cb) {
  var start = Date.now(), total = 0
  var s = Stats()
  var written = 0
  var b = bytes.slice(0, Math.pow(2, n))
  ;(function next () {
    var writeStart = Date.now()
    fs.write(fd, b, 0, b.length, null, function (err, _written) {
      if(err) throw err
//      fs.fsync(fd, function (err) {
        var time = Date.now() - writeStart
        written += _written;
        total += time
        s.value(time)
        if(Date.now() - start < 1000) return next()
        else {
          var fsyncStart = Date.now()
          fs.fsync(fd, function (err) {
            var value = s.toJSON()
            value.time = total/1000
            value.fsync = Date.now() - fsyncStart
            value.total = (total + value.fsync)/1000
            value.n = n
            value.size = Math.pow(2, n)
            value.written = written
            value.mb = written/MB
            value.rate = value.mb/value.total
            cb(null, value)
          })
        }
//      })
    })
  })()
}

pull(
  pull.count(N),
  pull.asyncMap(function (n, cb) {
    bench(n, cb)
  }),
  Stringify(),
  pull.log()
)

/*
running this experiment i do indeed see a non-linear response.
writing small buffers is slow, and then dramatically increases
to about 80 mb/s (on my hard drive)
sometimes peaking above that at 4k writes.
then the rate just stays level. I would expect it to step down at somepoint,
hitting a memory bottle kneck, but you can't create a buffer > 1gb,
so wasn't able to test that...

In practice, doing writes might cause other problems because having
that much memory in use will prevent other applications from using it.

except for bulk loads, large copies, or slow disks (like an SD card) fs write perf
is probably not the limiting factor. some cases like database compactions
will be effectively bulk loads/copies

ACTUALLY, no, write stream is only that fast because it's using
the fs cache. it's calling back before it's actually durably on disk,
if you put fs.fsync's in then it takes a lot longer, BUT if you write
the overhead on fsync is spinning the disk into place, so if you get a bunch
of writes in place it's not too slow.

maybe trick is doing fsync when there is a natural pause in the input stream?
*/






