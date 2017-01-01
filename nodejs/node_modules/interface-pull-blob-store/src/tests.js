'use strict'

const readWrite = require('./read-write')
const exists = require('./exists')
const remove = require('./remove')

module.exports = (common) => {
  readWrite(common)
  exists(common)
  remove(common)
}
