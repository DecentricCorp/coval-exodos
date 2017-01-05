var bitcoin = require('bitcoinjs-lib')
require('bitcoinjs-coval').register(bitcoin.networks)

module.exports = {
  base58: require('bs58'),
  bitcoin: bitcoin,
  ecurve: require('ecurve'),
  BigInteger: require('bigi'),
  Buffer: require('buffer')
}