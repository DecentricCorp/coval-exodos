//var bitcoin = require('bitcoinjs-lib')
//var ethUtil = require('ethereumjs-util')

function pretty(buf) {
  if (!Buffer.isBuffer(buf)) {
    return buf
  }
  var ret = buf.toString('hex')
  if (ret.length % 2)
    return '0x0' + ret
  else
    return '0x' + ret
}

function generatePayload(msg, key){
  if (bitcoin.bitcoin) {
    bitcoin = bitcoin.bitcoin
  }
  var value = new Buffer(key)
  var hash = bitcore.crypto.Hash.sha256(value)
  var privateKey = bitcore.PrivateKey.fromBuffer(hash)
  var hdPrivateKey = bitcore.HDPrivateKey.fromBuffer(value)
  var wif = privateKey.toWIF()
      value = new Buffer(msg)
      hash = bitcore.crypto.Hash.sha256(value)
  var keyPair = bitcoin.ECPair.fromWIF(wif,bitcoin.networks.coval)
  var sig = sign(keyPair, msg)
  var signerAddress = pretty(address(keyPair))
  return {
    coval: bitcoreSign(msg, hdPrivateKey.privateKey),
    contract: {
      signerAddress: signerAddress,
      signatureVersion: sig.v,
      signatureR: pretty(sig.r),
      signatureS: pretty(sig.s)
    }
  }      
}

function bitcoreSign(msg, key) {
  var _msg = bitcore.Message
  var m = _msg(msg)
  var s = m.sign(key)
  var covalAddress = key.toAddress().toString()
  return {
    toSign: msg,
    covalAddress: covalAddress,
    signature: s
  }
}

function address(keyPair) {
  return ethUtil.publicToAddress(keyPair.getPublicKeyBuffer(), true)
}

function parseSignature(signature) {
  return {
    // Since we decompress the key for the address,
    // we only need to know the sign of the signature
    v: ((signature[0] - 27) & 1) + 27,
    r: signature.slice(1, 33),
    s: signature.slice(33)
  }
}

function sign(keyPair, message) {
  var signature = bitcoin.message.sign(keyPair, message)
  return parseSignature(signature)
}

/*module.exports = {
  address: address,
  sign: sign,
  pretty: pretty,
  parseSignature: parseSignature
}*/
