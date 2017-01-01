'use strict'

const table = require('./base-table')
const varint = require('varint')

exports = module.exports

exports.addPrefix = (multicodecStrOrCode, data) => {
  let pfx

  if (Buffer.isBuffer(multicodecStrOrCode)) {
    pfx = multicodecStrOrCode
  } else {
    if (table[multicodecStrOrCode]) {
      pfx = table[multicodecStrOrCode]
    } else {
      throw new Error('multicodec not recognized')
    }
  }
  return Buffer.concat([pfx, data])
}

exports.rmPrefix = (data) => {
  varint.decode(data)
  return data.slice(varint.decode.bytes)
}

exports.getCodec = (prefixedData) => {
  const v = varint.decode(prefixedData)
  const code = new Buffer(v.toString(16), 'hex')
  let codec

  Object.keys(table)
        .forEach((mc) => {
          if (code.equals(table[mc])) {
            codec = mc
          }
        })

  return codec
}
