'use strict'

const constants = [
  ['base1', '1'],
  ['base2', '0'],
  ['base8', '7'],
  ['base10', '9'],
  ['base16', 'f'],
  ['base58flickr', 'Z'],
  ['base58btc', 'z'],
  ['base64', 'y'],
  ['base64url', 'Y']
]

const names = constants.reduce((prev, tupple) => {
  prev[tupple[0]] = tupple[1]
  return prev
}, {})

const codes = constants.reduce((prev, tupple) => {
  prev[tupple[1]] = tupple[0]
  return prev
}, {})

module.exports = {
  names: names,
  codes: codes
}
