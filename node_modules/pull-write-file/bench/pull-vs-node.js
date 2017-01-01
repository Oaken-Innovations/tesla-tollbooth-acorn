
var path = require('path')
var crypto = require('crypto')
var pull = require('pull-stream')
var osenv = require('osenv')
var Write = require('../')
var fs = require('fs')

var bytes = crypto.randomBytes(1024)
var MB = 1024*1024
var count = 0, start = Date.now()
var file = path.join(osenv.tmpdir(), 'pull-write-file_test.'+Date.now())

var N = 1024*10*64
function stats (start, bytes) {
  var size = count/MB
  var time = (Date.now()-start)/1000
  console.log('write', size,  'in', time, 'at', size/time )
}

var start = Date.now()
if(true)
  pull(
    pull.count(N),
    pull.map(function (e) {
      return bytes
    }),
    pull.through(function (d) {
      count += d.length
    }),
    Write(file, {}, function (err) {
      stats(start, count)
    })
  )
else {
  var ws = fs.createWriteStream(file)
  ws.on('drain', next)
  ws.on('finish', function () { stats(start, count) })
  function next () {
    while(N--> 0) {
      count += bytes.length
      if(ws.write(bytes) === false) return
    }
    if(N<0) return ws.end()
  }
  next()
}





