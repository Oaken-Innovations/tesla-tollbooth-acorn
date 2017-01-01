'use strict'

const constants = require('./constants')
const bs58 = require('bs58')

exports = module.exports = multibase
exports.encode = encode
exports.decode = decode
exports.isEncoded = isEncoded

const errNotSupported = new Error('Unsupported encoding')

// returns a new buffer with the multibase varint+code`
function multibase (nameOrCode, buf) {
  if (!buf) {
    throw new Error('requires an encoded buffer')
  }
  const code = getCode(nameOrCode)
  const codeBuf = new Buffer(code)

  const name = getName(nameOrCode)
  validEncode(name, buf)
  return Buffer.concat([codeBuf, buf])
}

function encode (nameOrCode, buf) {
  const name = getName(nameOrCode)

  let encode

  switch (name) {
    case 'base58btc': {
      encode = (buf) => { return new Buffer(bs58.encode(buf)) }
    } break
    default: throw errNotSupported
  }

  return multibase(name, encode(buf))
}

// receives a buffer or string encoded with multibase header
// decodes it and returns an object with the decoded buffer
// and the encoded type { base: <name>, data: <buffer> }
function decode (bufOrString) {
  if (Buffer.isBuffer(bufOrString)) {
    bufOrString = bufOrString.toString()
  }

  const code = bufOrString.substring(0, 1)
  bufOrString = bufOrString.substring(1, bufOrString.length)

  if (typeof bufOrString === 'string') {
    bufOrString = new Buffer(bufOrString)
  }

  let decode

  switch (code) {
    case 'z': {
      decode = (buf) => { return new Buffer(bs58.decode(buf.toString())) }
    } break
    default: throw errNotSupported
  }

  return decode(bufOrString)
}

function isEncoded (bufOrString) {
  if (Buffer.isBuffer(bufOrString)) {
    bufOrString = bufOrString.toString()
  }

  const code = bufOrString.substring(0, 1)
  try {
    const name = getName(code)
    return name
  } catch (err) {
    return false
  }
}

function validNameOrCode (nameOrCode) {
  const err = new Error('Unsupported encoding')

  if (!constants.names[nameOrCode] &&
      !constants.codes[nameOrCode]) {
    throw err
  }
}

function validEncode (name, buf) {
  let decode

  switch (name) {
    case 'base58btc': {
      decode = bs58.decode
      buf = buf.toString() // bs58 only operates in strings bs58 strings
    } break
    default: throw errNotSupported
  }

  decode(buf)
}

function getCode (nameOrCode) {
  validNameOrCode(nameOrCode)

  let code = nameOrCode

  if (constants.names[nameOrCode]) {
    code = constants.names[nameOrCode]
  }

  return code
}

function getName (nameOrCode) {
  validNameOrCode(nameOrCode)

  let name = nameOrCode

  if (constants.codes[nameOrCode]) {
    name = constants.codes[nameOrCode]
  }

  return name
}
