# ethereum-bsm

> Bitcoin Signed Message x Ethereum

A tutorial on how to validate in Ethereum, that a message has been signed with a valid Bitcoin key. This doesn't work with vanilla Bitcoin addresses, but a slightly
transformed Bitcoin public key is needed.

## Steps

The steps in short:

**1)** Encode a Bitcoin public key as an Ethereum address.

Take an uncompressed key, hash it with Keccak-256 and use the lower 160-bits of this hash. The result can be zero padded to 256-bits if needed. Call this `Be`.


**2)** Sign a message (call it `m`) with the Bitcoin key and keep the raw signature parameters.

The Bitcoin message signature is usually encoded as Base64, with the following underlying structure:
- `v`: 8 bits
- `r`: 256 bits
- `s`: 256 bits


**3)** Give `Be`, `m`, `v`, `r` and `s` to the contract to verify.

**Important**: this will only work with uncompressed Bitcoin keys! The tools provided below will keep keys in an uncompressed format.

## Tools

We supply two tools:

1) A Javascript library to generate the above needed parameters. See `bsm.js`.

2) A Solidity source code for Ethereum to validate these parameters in a smart contract. See `bsm.sol`.

## Example

In the below example we encode the message `Hello World` with a compressed Bitcoin key (`KzoNBaVaUqxRQo7P7kqvY5XP7DPzvauhikzWBLQFq4c76gi7Bzx4`).

```js
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
```

These parameters can be supplied to the `validateBSM` method in Solidity, which should return `true` if the signature belongs to that key:

```js
return validateBSM(
  'Hello World',
  0x20a6a4cf2be3b58136c5a54e0614fd50342a1204,
  27,
  0x9e04c5756c7ae43976057db9af52bd7f343dd06e3f881ca2e12849c4bf73f567,
  0x482a007dcd848b88ba133f786db0e2205ae35ce452f557c6b04d1fcc0497b87a
);
```

## License

MIT License

Copyright (C) 2016 Alex Beregszaszi
