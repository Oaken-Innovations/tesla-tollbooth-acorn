'use strict'

var multiaddr = require('multiaddr')

var IP = or(base('ip4'), base('ip6'))
var TCP = and(IP, base('tcp'))
var UDP = and(IP, base('udp'))
var UTP = and(UDP, base('utp'))
var WebSockets = and(TCP, base('ws'))
var WebRTCStar = and(base('libp2p-webrtc-star'), WebSockets, base('ipfs'))
var Reliable = or(WebSockets, TCP, UTP)

// required cause some transports are already IPFS aware (like WebRTCStar)
var IPFS = {
  matches: function (args) {
    var IPFS = and(Reliable, base('ipfs'))
    return IPFS.matches(args) || WebRTCStar.matches(args)
  }
}

exports.IP = IP
exports.TCP = TCP
exports.UDP = UDP
exports.UTP = UTP
exports.WebSockets = WebSockets
exports.WebRTCStar = WebRTCStar
exports.Reliable = Reliable
exports.IPFS = IPFS

function and () {
  var args = Array.from(arguments)

  function matches (a) {
    if (typeof a === 'string') {
      a = multiaddr(a)
    }
    var out = partialMatch(a.protoNames())
    if (out === null) {
      return false
    }
    return out.length === 0
  }

  function partialMatch (a) {
    if (a.length < args.length) {
      return null
    }
    args.some(function (arg) {
      a = arg.partialMatch(a)
      if (a === null) {
        return true
      }
    })

    return a
  }

  return {
    input: args,
    matches: matches,
    partialMatch: partialMatch
  }
}

function or () {
  var args = Array.from(arguments)

  function matches (a) {
    if (typeof a === 'string') {
      a = multiaddr(a)
    }
    var out = partialMatch(a.protoNames())
    if (out === null) {
      return false
    }
    return out.length === 0
  }

  function partialMatch (a) {
    var out = null
    args.some(function (arg) {
      var res = arg.partialMatch(a)
      if (res) {
        out = res
        return true
      }
    })

    return out
  }

  var result = {
    toString: function () { return '{ ' + args.join(' ') + ' }' },
    input: args,
    matches: matches,
    partialMatch: partialMatch
  }

  return result
}

function base (n) {
  var name = n
  function matches (a) {
    if (typeof a === 'string') {
      a = multiaddr(a)
    }

    var pnames = a.protoNames()
    if (pnames.length === 1 && pnames[0] === name) {
      return true
    }
    return false
  }

  function partialMatch (protos) {
    if (protos.length === 0) {
      return null
    }

    if (protos[0] === name) {
      return protos.slice(1)
    }
    return null
  }

  return {
    toString: function () { return name },
    matches: matches,
    partialMatch: partialMatch
  }
}
