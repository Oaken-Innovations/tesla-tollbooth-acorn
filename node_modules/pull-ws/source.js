/**
  ### `source(socket)`

  Create a pull-stream `Source` that will read data from the `socket`.

  <<< examples/read.js

**/

module.exports = function(socket, cb) {
  var buffer = [];
  var receiver;
  var ended;
  var started = false;
  socket.addEventListener('message', function(evt) {
    var data = evt.data;

    if (data instanceof ArrayBuffer) {
      data = new Buffer(data);
    }

    if (receiver) {
      return receiver(null, data);
    }

    buffer.push(data);
  });

  socket.addEventListener('close', function(evt) {
    if (ended) return
    if (receiver) {
      receiver(ended = true)
    }
  });

  socket.addEventListener('error', function (evt) {
    if (ended) return;
    ended = evt;
    if(!started) {
      started = true
      cb && cb(evt)
    }
    if (receiver) {
      receiver(ended)
    }
  });

  socket.addEventListener('open', function (evt) {
    if(started || ended) return
    started = true
  })

  function read(abort, cb) {
    receiver = null;

    //if stream has already ended.
    if (ended)
      return cb(ended);

    // if ended, abort
    else if (abort) {
      //this will callback when socket closes
      receiver = cb
      socket.close()
    }

    // return data, if any
    else if(buffer.length > 0)
      cb(null, buffer.shift());

    // wait for more data (or end)
    else
      receiver = cb;

  };

  return read;
};
