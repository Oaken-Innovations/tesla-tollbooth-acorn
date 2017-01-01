# pull-write-file

pull-stream version of fs.createWriteStream

currently really simple and does not yet support all fs.createWriteStream options yet.

## Example

``` js
var Write = require('pull-write-stream')

pull(
  source, //must be buffers (sorry, strings not working yet!)
  Write(pathToFile, {}, function (err) {
    //callback is called once write is complete,
    //and file descriptor is closed
  })
)

```

## Performance

For large buffers this is currently as fast as node's streams,
but for lots of small buffers it's a little less.
Node uses the fs binding's `writev` to pass many buffers to the kernel simutaniously.

TODO: benchmarks with graphs comparing node streams and pull streams.

## License

MIT
