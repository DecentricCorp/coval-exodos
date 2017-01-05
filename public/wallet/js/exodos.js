var _keys
var _sigs = []
//All Coval Keys
me.data.privkey.allRecordsArray(function(items){
    _keys = items.filter(function(item){return item.key.network.name==="coval"})
    
    _keys.forEach(function(item){
        console.log(item)
        _sigs[_sigs.length] = Message('hello, world').sign(bitcore.PrivateKey(item.key.privatekey));
    })
})

//var value = new Buffer("Cm2K4bCxFf9jD9WivDxUsGVnLzbWfeLNiPdesfGiyMMue3eJVwM1XBhuFqBCeEhbqUJoK6wLdApNt4LvN3RixCfYjDoC4iNVUTvuNTERmtT6reJs");
//var hash = bitcore.crypto.Hash.sha256(value);
//var privateKey = bitcore.PrivateKey.fromBuffer(hash);
//var wif = privateKey2.toWIF()

/*
bitcoin = bitcoin.bitcoin
var value = new Buffer("Cm2K4bCxFf9jD9WivDxUsGVnLzbWfeLNiPdesfGiyMMue3eJVwM1XBhuFqBCeEhbqUJoK6wLdApNt4LvN3RixCfYjDoC4iNVUTvuNTERmtT6reJs")
var hash = bitcore.crypto.Hash.sha256(value)
var privateKey = bitcore.PrivateKey.fromBuffer(hash)
var hdPrivateKey = bitcore.HDPrivateKey.fromBuffer(value)
var wif = privateKey.toWIF()
//var wif = hdPrivateKey.privateKey.toWIF()
    value = new Buffer("Hello World")
	hash = bitcore.crypto.Hash.sha256(value)
var keyPair = bitcoin.ECPair.fromWIF(wif)
var sig = sign(keyPair, 'Hello World')
//var sig = keyPair.sign(hash)
//    sig.v = ((sig - 27) & 1) + 27
    //time to return these
var signerAddress = pretty(address(keyPair))
    console.log(signerAddress)
    console.log(sig.v)
    console.log(pretty(sig.r.toBuffer()))
    console.log(pretty(sig.s.toBuffer()))
//var bitcorePubkey = bitcore.PublicKey.fromBuffer(keyPair.Q.getEncoded(false))
//bitcore
var hd = bitcore.HDPrivateKey("Cm2K4bCxFf9jD9WivDxUsGVnLzbWfeLNiPdesfGiyMMue3eJVwM1XBhuFqBCeEhbqUJoK6wLdApNt4LvN3RixCfYjDoC4iNVUTvuNTERmtT6reJs")
var baseAddress = hd.privateKey.toAddress().toString()
var derived = hd.derive("m/44'/0'/0'/0/1")
var wtf = derived.privateKey.toAddress().toString()
 */


//Export Mnemonic
//IN Password
//OUT serialized mneumonic
//-------- getMyMnemonic("astmd-4236",cb)