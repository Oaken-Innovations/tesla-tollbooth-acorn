
/* jshint node: true */
'use strict';

var fs = require('fs');
var Decoder = require('pull-utf8-decoder')
/**
  # pull-file

  This is a simple module which uses raw file reading methods available in
  the node `fs` module to read files on-demand.  It's a work in progress
  and feedback is welcome :)

  ## Example Usage

  <<< examples/ipsum-chunks.js

**/
module.exports = function(filename, opts) {
  var mode = opts && opts.mode || 0x1B6; // 0666
  var bufferSize = opts && opts.bufferSize || 1024*64;
  var start = opts && opts.start || 0
  var end = opts && opts.end || Number.MAX_SAFE_INTEGER
  var fd = opts && opts.fd
  var ended, closeNext, busy, _cb;
  var _buffer = new Buffer(bufferSize)

  var flags = opts && opts.flags || 'r'

  function readNext(cb) {
    if(closeNext) return close(cb)
    var toRead = Math.min(end - start, bufferSize);
    busy = true

    fs.read(
      fd,
      _buffer,
      0,
      toRead,
      start,
      function(err, count, buffer) {
        busy = false
        start += count;
        // if we have received an end noticiation, just discard this data
        if(closeNext) {
          close(_cb)
          return cb(closeNext)
        }

        if (ended) {
          return cb(err || ended);
        }

        // if we encountered a read error pass it on
        if (err) {
          return cb(err);
        }

        if(count === buffer.length) {
          cb(null, buffer);
        } else {
          closeNext = true;
          cb(null, buffer.slice(0, count));
        }
      }
    );
    _buffer = new Buffer(Math.min(end - start, bufferSize))
  }

  function open(cb) {
    busy = true
    fs.open(filename, flags, mode, function(err, descriptor) {
      // save the file descriptor
      fd = descriptor;

      busy = false
      if(closeNext) {
        close(_cb)
        return cb(closeNext)
      }

      if (err) {
        return cb(err);
      }

      // read the next bytes
      return readNext(cb);
    });
  }

  function close (cb) {
    //if auto close is disabled, then user manages fd.
    if(opts && opts.autoClose === false) return cb(true)

    //wait until we have got out of bed, then go back to bed.
    //or if we are reading, wait till we read, then go back to bed.
    else if(busy) {
      _cb = cb
      return closeNext = true
    }

    //first read was close, don't even get out of bed.
    else if(!fd) {
      return cb(true)
    }

    //go back to bed
    else {
      fs.close(fd, function(err) {
        fd = null;
        cb(err || true);
      });
    }
  }

  function source (end, cb) {
    if (end) {
      ended = end;
      close(cb);
    }
    // if we have already received the end notification, abort further
    else if (ended) {
      cb(ended)
    }

    else if (! fd) {
      open(cb);
    }

    else
      readNext(cb);
  };

  //read directly to text
  if(opts && opts.encoding)
    return Decoder(opts.encoding)(source)

  return source

};










