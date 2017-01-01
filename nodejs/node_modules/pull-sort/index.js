
var Source = require('pull-defer/source')
var pull = require('pull-stream')

module.exports = function (compare) {

  var source = Source()

  var sink = pull.collect(function (err, ary) {
    source.resolve(pull.values(ary.sort(compare)))
  })

  return function (read) {
    sink(read)
    return source
  }

}
