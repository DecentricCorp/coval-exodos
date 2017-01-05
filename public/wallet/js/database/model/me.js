var me = {}
var addresses = []



me.data = newtables
me.password = ""
me.friends = function(cb) {
    var friends = []
    newtables.peers.allRecordsArray(function (results) {
        $.each(results, function (k, v) {
            if (this.isfriend) { friends.push(this) }
            if (results.length - 1 === k) {
                return cb(friends)
            }
        })
    })
}

me.addresses = function (cb) {
    if (addresses.length === 0) {
        return updateAddresses(cb)
    } else {
        return cb(addresses)
    }
}

me.updateAddresses = updateAddresses
function updateAddresses(cb) {
    newtables.privkey.allRecordsArray(function (records) {
        $(records).each(function (key, privatekey) {
            var address = getAddressFromPrivateKey(privatekey.key)
            if (!inAddressArray(address)) {
                addresses.push(address)
            }
            if (key + 1 === records.length) {
                return cb(addresses)
            }
        })
    })
}

me.flushAddresses = flushAddresses
function flushAddresses(cb)
{
    addresses = []
    updateAddresses(cb)
}


function getAddressFromPrivateKey(pk) {
    var address
    try {
        address = bitcore.HDPrivateKey(JSON.parse(pk).xprivkey).privateKey.toAddress().toString()
    } catch (e) {
        address = bitcore.HDPrivateKey(pk.xprivkey).privateKey.toAddress().toString()
    }
    return address
}

function inAddressArray(address) {
    return $.inArray(address, addresses) > -1
}

me.interested = function (outs, cb) {
    if (addresses.length === 0) {
        me.addresses(function() {})
    }
    $(outs).each(function (key, value) {
        var address, amount
        var vout = value
        for (var k in vout) {
            if (vout.hasOwnProperty(k)) {
                amount = vout[k]
                address = k
                if (inAddressArray(address)) {
                    return cb(true, address, amount)
                }
            }
        }
        
    })
    
}