var identity = {}

var Identity = function (obj) {
    identity.bio = obj.bio
    identity.name = obj.name
    identity.nickname = obj.name
    identity.photo = obj.photo
    identity.social = obj.social
    return identity
}

identity.generate = function (cb) {
    var HDKey = new bitcore.HDPrivateKey()
    return cb(HDKey)
}

identity.getIdentity = function (cb) {
    return cb(foundIdentity[0].address.addressData)
}

identity.getIdentityObject = function (cb) {
    return cb(foundIdentity[0])
}

identity.getIdentityPrivateKey = function (cb) {
    var privateKey
    identity.getIdentity(function (record) {
        privateKey = new bitcore.HDPrivateKey(record.key)
        return cb(privateKey)
    })
}

identity.getIdentityPublicKey = function (cb) {
    identity.getIdentityPrivateKey(function (record) {
        return cb(bitcore.HDPublicKey(record).toString())
    })
}

identity.getIdentityAddress = function (cb) {
    identity.getIdentityPrivateKey(function (record) {
        var newAddress = new bitcore.Address(record.publicKey, bitcore.Networks.livenet)
        return cb(newAddress.toString())
    })
}



