var bitcoin = require('bitcoinjs-lib')
var bsm = require('./bsm.js')

var keyPair = bitcoin.ECPair.fromWIF('KzoNBaVaUqxRQo7P7kqvY5XP7DPzvauhikzWBLQFq4c76gi7Bzx4')

console.log(bsm.pretty(bsm.address(keyPair))) // 0x20a6a4cf2be3b58136c5a54e0614fd50342a1204

var sig = bsm.sign(keyPair, 'Hello World')
console.log(sig.v) // 27
console.log(bsm.pretty(sig.r)) // 0x9e04c5756c7ae43976057db9af52bd7f343dd06e3f881ca2e12849c4bf73f567
console.log(bsm.pretty(sig.s)) // 0x482a007dcd848b88ba133f786db0e2205ae35ce452f557c6b04d1fcc0497b87a

var sig = bsm.sign(keyPair, 'Hello World Too')
console.log(sig.v) // 28
console.log(bsm.pretty(sig.r)) // 0x3e6de3b0544103489dd8d3c5be20d540353a17f1830b3646b5decbae4b8fbe6e
console.log(bsm.pretty(sig.s)) // 0x67f9236d0af4e9fc929f2105d05de5f2b1d737de5e6fbf67b1862f7fa18020f1
