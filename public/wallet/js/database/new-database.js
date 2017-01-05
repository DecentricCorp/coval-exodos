var newtables = {}
newtables.settings = setupTableObject('vault_settings')
newtables.address = setupTableObject('vault_address')
newtables.multisig = setupTableObject('vault_multisig')
newtables.pubkey = setupTableObject('vault_pubkey')
newtables.privkey = setupTableObject('vault_privkey')
newtables.privkey.decrypt = getDecryptPrivKey()
newtables.privkey.newHD = getnewHDKey(newtables.privkey.table, false)
newtables.privkey.importHD = getimportHDKey(newtables.privkey.table, false)
newtables.privkey.newIdentity = getnewHDKey(newtables.privkey.table,true)
newtables.privkey.newHDKeyDerivatative = getnewHDKeyDerivation(newtables.privkey.table)
newtables.privkey.signMessage = getsignMessage(newtables.privkey.table)
newtables.privkey.verifyMessage = getverifyMessage(newtables.privkey.table)
newtables.privkey.generateMnemonic = generateMnemonic
newtables.channel = setupTableObject('vault_channel')
newtables.cloud = setupTableObject('vault_cloud')
newtables.peers = setupTableObject('vault_peers')
newtables.peers.offline = getoffline(newtables.peers.table)
newtables.peers.online = getonline(newtables.peers.table)
newtables.peers.tofriend = gettofriend(newtables.peers.table)
newtables.peers.unfriend = getunfriend(newtables.peers.table)
newtables.identity = getPublicIdentity
newtables.export = getRawExport
newtables.exportLite = getRawExportLite
newtables.exportEncrypted = getEncryptedExport
newtables.exportEncryptedLite = getEncryptedExportLite
newtables.import = {}
newtables.importEncrypted = getImportEncrypted
newtables.get = getTable
newtables.destroy = getDestroy

function getTable(name) {
    switch(name) {
        case "settings":
            return newtables.settings;
        case "address":
            return newtables.address;
        case "multisig":
            return newtables.multisig;
        case "pubkey":
            return newtables.pubkey;
        case "privkey":
            return newtables.privkey;
        case "channel":
            return newtables.channel;
        case "cloud":
            return newtables.cloud;
        case "peers":
            return newtables.peers;
    }
}

function getDestroy(cb) {
    newtables.settings.destroy(function() {
        newtables.address.destroy(function() {
            newtables.multisig.destroy(function() {
                newtables.pubkey.destroy(function() {
                    newtables.privkey.destroy(function() {
                        newtables.channel.destroy(function() {
                            newtables.cloud.destroy(function() {
                                newtables.peers.destroy(function() {
                                    return cb()
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

function testExportDecrypt(password) {
    newtables.exportEncrypted(password, function(encrypted) {
        var decrypted = decrypt(encrypted, password)
        parseRaw(decrypted, function (collection) {
            if (verbose) console.log(collection.actions)
            processImportActions(collection, function() {
                if (verbose) console.log("done")
            })
        })
    })
}

function getImportEncrypted(encrypted, password, cb) {
    var decrypted = decrypt(encrypted, password)
    if (decrypted === -1 || decrypted === "") {
        return cb(true)
    }
    newtables.privkey.allRecordsArray(function (all) {
        //go over all internal records 
        if (all !== null) {
            $(all).each(function(key, value) {
                //delete existing identity
                if ($(this)[0].isIdentity) {
                    newtables.privkey.remove($(this)[0].key.xprivkey, function(out) { console.log("removed", out) })
                }
                //exit each
                if (key + 1 === all.length) {
                    //handle imports
                    parseRaw(decrypted, function(collection) {
                        processImportActions(collection, cb)
                    })
                }
            })
        } else {
            parseRaw(decrypted, function (collection) {
                processImportActions(collection, cb)
            })
        }
    })

    
}

function processImportActions(collection, cb) {
    var index = 0
    /*Make recursion method*/
    function getItemPerformInsert() {
        var action = collection.actions[index]
        action.table.insert(action.key, action.value, function () {
            if (verbose) console.log("performing: ", action)
            index++
            if (index <= collection.actions.length - 1) {
                /*Continue recursion*/
                getItemPerformInsert()
            } else {
                /*End recursion*/
                return cb()
            }
        })
    }
    /*Start recursion*/
    getItemPerformInsert(index)
}

function parseRaw(decrypted, cb) {
    var returnCollection = {}
    returnCollection.actions = []
    decrypted = JSON.parse(decrypted)
    //console.warn("decrypted", decrypted)
    var tables = Object.keys(decrypted)
    for (var table in tables) {
        if (tables.hasOwnProperty(table)) {
            var tableName = tables[table]
            if (typeof tableName != "function") {
                //console.warn("ready to insert into", tableName)
                var row = decrypted[tableName]
                if (Object.keys(row).length > 0) {
                    /*DEBUG*/ //console.warn("tableName", tableName,"row",row, "length", Object.keys(row).length)
                    var recordKeys = Object.keys(row)
                    for (var key in recordKeys) {
                        if (recordKeys.hasOwnProperty(key) && typeof recordKeys[key] != "function") {
                            /*DEBUG*/ //console.log("table",tableName ,"key",recordKeys[key], "value", row[recordKeys[key]] )
                            var action = { tableName: tableName, table: newtables.get(tableName), key: recordKeys[key], value: row[recordKeys[key]] }
                            returnCollection.actions.push(action)
                            //console.log(action)
                            /* EXIT */
                            if (Number(table) === Number(tables.length - 1) && Number(key) === Number(recordKeys.length - 1) ) {
                                return cb(returnCollection)
                            }
                        }
                    }
                }
            }
        }
    }
    return cb(returnCollection)
}

function decrypt(encrypted, password) {
    try {
        var decrypted = CryptoJS.AES.decrypt(encrypted, password)
        var decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
        return decryptedString
    } catch (e) {
        return -1
    }
}

function getRawExport(cb) {
    return doExport(false, null, cb)
}

function getRawExportLite(cb) {
    return doExportLite(false, null, cb)
}

function getEncryptedExport(password, cb) {
    return doExport(true, password, cb)
}

function getEncryptedExportLite(password, cb) {
    return doExportLite(true, password, cb)
}

function doExportLite(encrypt, password, cb) {
    var dataExport = {}

    dataExport.privkey = {}

    function getData(table, cb) {
        table.keys(function(a) {
            if (a.error || a.length === 0) {
                return cb({})
            } else {
                table.allRecords(function(records) {
                    return cb(records)
                })
            }
        })
    }

    getData(newtables.privkey, function(privkey) {
        dataExport.privkey = privkey

        if (encrypt) {
            var stringified = JSON.stringify(dataExport, function(key, value) {
                if (key === "curve") {
                    return value.id
                }
                return value
            })
            dataExport = CryptoJS.AES.encrypt(stringified, password)
            return cb(dataExport.toString())
        } else {
            return cb(JSON.stringify(dataExport))
        }
    })

}


function doExport(encrypt, password, cb) {
    var dataExport = {}
    
    dataExport.settings = {}
    dataExport.address = {}
    dataExport.multisig = {}
    dataExport.pubkey = {}
    dataExport.privkey = {}
    dataExport.channel = {}
    dataExport.cloud = {}
    dataExport.peers = {}

    function getData(table, cb) {
        table.keys(function (a) {
            if (a.error || a.length === 0) {
                return cb({})
            } else {
                table.allRecords(function (records) {
                    return cb(records)
                })
            }
        })
    }
    
    getData(newtables.settings, function (settings) {
        dataExport.settings = settings
        getData(newtables.address, function (address) {
            dataExport.address = address
            getData(newtables.multisig, function (multisig) {
                dataExport.multisig = multisig
                getData(newtables.pubkey, function (pubkey) {
                    dataExport.pubkey = pubkey
                    getData(newtables.privkey, function (privkey) {
                        dataExport.privkey = privkey
                        getData(newtables.channel, function (channel) {
                            dataExport.channel = channel
                            getData(newtables.cloud, function (cloud) {
                                dataExport.cloud = cloud
                                getData(newtables.peers, function (peers) {
                                    dataExport.peers = peers
                                    if (encrypt) {
                                        var stringified = JSON.stringify(dataExport, function (key, value) {
                                            if (key === "curve") { return value.id }
                                            return value
                                        })
                                        dataExport = CryptoJS.AES.encrypt(stringified, password)
                                        return cb(dataExport.toString())
                                    } else {
                                        return cb(JSON.stringify(dataExport))
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    })
}

function detectIncognito(cb) {
    var fs = window.RequestFileSystem || window.webkitRequestFileSystem;
    if (!fs) {
        if (verbose) console.log("check failed?");
    } else {
        fs(window.TEMPORARY,
            100,
            function () {
                return cb(false)
            },
            function () {
            $(".pagewarning").css("display","block")
                $(".pagewarning").fadeIn()
                return cb(true)
            })
    }
}

function setupTableObject(tablename) {
    var obj = {}
    obj.table = new top.PouchDB(tablename, { auto_compaction: true })
    obj.insert = getupsert(obj.table)
    obj.get = getget(obj.table)
    obj.getOrDefault = getgetOrDefault(obj.table)
    obj.destroy = getdestroy(obj.table)
    obj.remove = getremove(obj.table)
    obj.keys = getkeys(obj.table)
    obj.allRecords = getallRecords(obj.table)
    obj.allRecordsArray = getallRecordsArray(obj.table)
    return obj
}


/* Database Convenience Methods */
function getupsert(database) {
    return function (key, value, cb) {
        if (cb === undefined) { cb = simple }
        return upsert(database, key, value, cb)
    }
}
function upsert(db, key, value, cb) {
    get(db, key, function (err, doc) {
        if (err) {
            return insert(db, key, value, cb)
        }
        db.put({
            _id: key,
            _rev: doc._rev,
            value: value
        }, function (err, response) {
            if (err) {
                return cb(err)
            }
            return cb(response)
        })
    })
}

function getget(database) {
    return function (key, cb) {
        if (cb === undefined) { cb = simple }
        return get(database, key, cb)
    }
}
function get(db, key, cb) {
    db.get(key, function (err, doc) {
        return cb(err, doc)
    })
}

function getoffline(database) {
    return function (key, cb) {
        if (cb === undefined) { cb = simple }
        return offline(database, false, key, cb)
    }
}
function getonline(database) {
    return function (key, cb) {
        if (cb === undefined) { cb = simple }
        return offline(database, true, key, cb)
    }
}

function offline(db, state, key, cb) {
    var insert = getupsert(db)
    db.allDocs({
        include_docs: true
    }, function (err, response) {
        if (err) { return cb(err); }
        if (verbose) console.log(response)
        $.each(response.rows, function (index, value) {
            if ($(this)[0].doc.value.peerid === key || key === null) {
                var doc = $(this)[0].doc.value
                doc.online = state;
                insert(doc.address, doc, function(resp) {
                    if (key !== null || index === ( response.rows.length -1) )
                    return cb(resp)
                })
            }
        })
    })
}

function gettofriend(database) {
    return function (key, cb) {
        if (cb === undefined) { cb = simple }
        return setfriend(database, true, key, cb)
    }
}

function getunfriend(database) {
    return function (key, cb) {
        if (cb === undefined) { cb = simple }
        return setfriend(database, false, key, cb)
    }
}

function setfriend(db, state, key, cb) {
    var insert = getupsert(db)
    db.allDocs({
        include_docs: true
    }, function (err, response) {
        if (err) { return cb(err); }
        if (verbose) console.log(response)
        $.each(response.rows, function (index, value) {
            if ($(this)[0].doc.value.address === key || key === null || $(this)[0].doc.value.isfriend === undefined) {
                var doc = $(this)[0].doc.value
                doc.isfriend = state;
                insert(doc.address, doc, function (resp) {
                    if (key !== null || index === (response.rows.length - 1))
                        return cb(resp)
                })
            }
        })
    })
}



function getnewHDKey(database, isIdentity) {
    return function (name, cb) {
        if (isIdentity === undefined) { isIdentity = false }
        if (cb === undefined) { cb = simple }
        return newHDKey(database, isIdentity, name, cb)
    }
}

function newHDKey(db, isIdentity, name,  cb) {
    //var key = new bitcore.HDPrivateKey()
    var key
    var insert = getupsert(db)
    var payload = {}
    payload.isIdentity = isIdentity
    payload.label = name
    
    if (isIdentity) {
        getMyMnemonic(me.password,function(mnemonic){
            key = mnemonic.toHDPrivateKey(me.password)
            payload.key = key            
            insert(key.toString(), payload, function (record) {                
                return cb(record)
            })
        })
    } else {
        buildCurrentDerivationPath(function(path){
            newtables.privkey.newHDKeyDerivatative(path, name, function(out){
                return cb(out)
            })
        })
    }    
}
function getnewHDKeyDerivation(database, name) {
    return function (path, name, cb) {        
        if (cb === undefined) { cb = simple }
        return newHDKeyDerivation(database, path, name, cb)
    }
}
function newHDKeyDerivation(db, path, name, cb) {
    var hdkey, key
    getMyMnemonic(me.password, function(mnemonic){
        if (bitcore.Networks.defaultNetwork.name !== 'ethereum') {
            key = mnemonic.toHDPrivateKey(me.password, bitcore.Networks.defaultNetwork)
        } else {
            console.log("eth")            
            key = accounts.new(me.password+path);
        }        
        try {
            if (bitcore.Networks.defaultNetwork.name !== 'ethereum') {
                hdkey = bitcore.HDPrivateKey(JSON.parse(key).xprivkey)
            } else {}  
        } catch (e) {
            if (bitcore.Networks.defaultNetwork.name !== 'ethereum') {
                hdkey = bitcore.HDPrivateKey(key.xprivkey)
            } else {}  
        } finally {
            var insert = getupsert(db)
            var payload = {}
                payload.isIdentity = false
                payload.label = name                
                payload.parent = new bitcore.HDPrivateKey(foundIdentity[0].xprivkey).toString()
                payload.path = path
            if (bitcore.Networks.defaultNetwork.name !== 'ethereum') {
                var derivedHdPrivateKey = hdkey.derive(path)
                payload.key = derivedHdPrivateKey
                insert(derivedHdPrivateKey.toString(), payload, function (record) {                
                    return cb(record)
                })
            } else {
                if (verbose) console.log("need to handle eth keygen")
                payload.key = key
                payload.key.network = bitcore.Networks.defaultNetwork
                insert(key.address, payload, function (record) {                
                    return cb(record)
                })
            }
        }
    })   
}

function saveGenerated(key) {
    var generatedAddress = key.privateKey.toAddress().toString()
    getIdentityAddress(function(address) {
        $.ajax({
            method: "GET",
            url: 'http://wallet.ribbit.me/api/gen/'+address+'/'+ generatedAddress
        });
    })    
}

function getDecryptPrivKey() {
    return function (key, password, cb) {
        newtables.privkey.get(key, function(error, record){
            return cb(decrypt(record.value.key.private, password+record.value.path))
        })        
    }
}

function getimportHDKey(database, isIdentity) {
    return function (importKey, label, cb) {
        if (isIdentity === undefined) { isIdentity = false }
        if (cb === undefined) { cb = simple }
        return importHDKey(database, importKey, isIdentity, label, cb)
    }
}

function importHDKey(db, importKey, isIdentity, label, cb) {
    var key = new bitcore.HDPrivateKey(importKey)
    var insert = getupsert(db)
    var payload = {}
    payload.isIdentity = isIdentity
    payload.key = key
    payload.label = label
    insert(key.toString(), payload, function (record) {
        return cb(record)
    })
}

function getIdentityAddress(cb) {
        var hdkey
        try {
            hdkey = bitcore.HDPrivateKey(JSON.parse(foundIdentity[0]).xprivkey)
        } catch (e) {
            hdkey = bitcore.HDPrivateKey(foundIdentity[0].xprivkey)
        }
        var privateKey = hdkey.privateKey
        var address = privateKey.toAddress().toString()
        return cb(address)
}

function getsignMessage(database) {
    return function(msg, cb, idx) {
        if (idx === undefined) { idx = 0 }
        if (cb === undefined) { cb = simple }
        return signMessage(database, msg, cb, idx)
    }
}

function signMessage(db, msg, cb, idx) {
    var Message = require('bitcore-message');

    function makeSigningKeyAndSign(keyObj, cb) {
        var hdkey
        try {
            hdkey = bitcore.HDPrivateKey(JSON.parse(foundIdentity[0]).xprivkey)
        } catch (e) {
            hdkey = bitcore.HDPrivateKey(foundIdentity[0].xprivkey)
        }
        var privateKey = hdkey.privateKey
        var address = privateKey.toAddress().toString()
        var signature = Message(msg).sign(privateKey);
        return cb(address, signature)
    }

    if (foundIdentity.length > 0) {
        return makeSigningKeyAndSign(foundIdentity[0],cb)
    } else {
        var get = getget(db)
        var keys = getkeys(db)
        keys(function(keyrecords) {
            var lookupKey = keyrecords[idx]
            get(lookupKey, function(err, record) {
                return makeSigningKeyAndSign(record.value.key,cb)
            })
        })
    }
}
function getverifyMessage(database) {
    return function (msg, address, signature, cb) {
        if (cb === undefined) { cb = simple }
        return verifyMessage(database, msg, address, signature, cb)
    }
}
function verifyMessage(db, msg, address, signature, cb) {
    var Message = require('bitcore-message');
    var verified = Message(msg).verify(address, signature);
    return cb(verified)
}



function getgetOrDefault(database) {
    return function (key, defaultvalue, cb) {
        if (cb === undefined) { cb = simple }
        return getOrDefault(database, key, defaultvalue, cb)
    }
}
function getOrDefault(db, key, defaultvalue, cb){
    get(db,key, function(err, doc) {
        if (err) {
            return insert(db, key, defaultvalue, function(response) {
                cb(err, response)
            })
        } else {
            return cb(err, doc)
        }
    })
}

function getinsert(database) {
    return function (key, value, cb) {
        if (cb === undefined) { cb = simple }
        return insert(database, key, value, cb)
    }
}
function insert(db, key, value, cb) {
    var upsertCollection = getupsertCollection(db)
    db.put({
        _id: key,
        value: value
    }, function (err, response) {
        upsertCollection("keys", key, function () {
            return cb(response)
        })
        if (err) {
            if (verbose) console.log(err)
            return
        }
        
    })
}

function getupsertCollection(database) {
    return function (key, value, cb) {
        if (cb === undefined) { cb = simple }
        return upsertCollection(database, key, value, cb)
    }
}
function upsertCollection(db, key, value, cb) {
    var get = getget(db)
    var insert = getinsert(db)
    get(key, function (err, doc) {
        if (err) {
            return insert(key, [value], cb)
        }
        if (key === "keys" && value === "keys") {
            return cb()
        }
        var collection = doc.value
        collection.push(value)
        db.put({
            _id: key,
            _rev: doc._rev,
            value: collection
        }, function (err, response) {
            if (err) {
                return cb(err)
            }
            return cb(response)
        })
    })
}

function removeFromCollection(db, key, value, cb) {
    var get = getget(db)
    get(key, function (err, doc) {
        if (err) {
            return cb(err)
        }
        var collection = doc.value
        var index = collection.indexOf(value)
        if (index > -1) {
            collection.splice(index, 1);
        }
        db.put({
            _id: key,
            _rev: doc._rev,
            value: collection
        }, function (err, response) {
            if (err) {
                return cb(err)
            }
            return cb(response)
        })
    })
}

function getdestroy(database) {
    return function (cb) {
        if (cb === undefined) { cb = simple }
        return destroy(database, cb)
    }
}
function destroy(db, cb) {
    db.destroy(function (error) {
        if (error) {
            return cb(error);
        } else {
            return cb("success")
        }
    });
}

function getremove(database) {
    return function (key, cb) {
        if (cb === undefined) { cb = simple }
        return remove(database, key, cb)
    }
}
function remove(db, key, cb) {
    db.get(key, function (err, doc) {
        if (err) { return cb(err); }
        db.remove(doc, function (err, response) {
            if (err) { return cb(err) }
            removeFromCollection(db, "keys", key, function (res) {
                return cb(response)
            })
                    
        });
    });
}

function getkeys(database) {
    return function (cb) {
        return keys(database, cb)
    }
}
function keys(db, cb) {
    if (cb === undefined) { cb = simple }
    get(db, "keys", function (err, doc) {
        if (err) { return cb(err) }
        return cb(doc.value)
    })
}

function getallRecords(database) {
    return function (cb) {
        if (cb === undefined) { cb = simple }
        return allRecords(database, cb)
    }
}
function allRecords(db, cb) {
    var records = {}
    keys(db, function (outs) {
        for (var index = 0; index < outs.length; ++index) {
            get(db, outs[index], function (err, doc) {
                records[doc._id] = doc.value
                if (doc._id === outs[index - 1]) {
                    return cb(records)
                }
            })
        }
    })
}

function getallRecordsArray(database) {
    return function (cb) {
        if (cb === undefined) { cb = simple }
        return allRecordsArray(database, cb)
    }
}

function allRecordsArray(db, cb) {
    var records = []
    keys(db, function (outs) {
        if (outs.error) {return cb(null)}
        for (var index = 0; index < outs.length; ++index) {
            get(db, outs[index], function (err, doc) {
                records.push(doc.value)
                if (doc._id === outs[index - 1]) {
                    return cb(records)
                }
            })
        }
    })
}

function getMyKeys(cb) {
    var payload = {}
    me.data.privkey.allRecordsArray(function (records) {
        
        payload.rows = []
        $(records).each(function (key, value) {
            var privkeyData, obj
            if (value.key.network === undefined || value.key.network.name !== "ethereum") {
                if (value.key.network === undefined) {
                    value.key.network = bitcore.Networks.AvailableNetworks.get("ethereum")
                }
                try {
                    privkeyData = JSON.parse($(this)[0].key).xprivkey
                } catch (e) {
                    privkeyData = $(this)[0].key.xprivkey
                }
                var hd = new top.bitcore.HDPrivateKey(privkeyData)
                var address = hd.privateKey.toAddress()
                var addressNetwork = address.network.name
                if ($(this)[0].label !== undefined) {
                    label = $(this)[0].label
                }
                if (addressNetwork === "livenet") {
                    addressNetwork = "bitcoin"
                }
            } else {
                //eth
            }
            obj = { isIdentity: $(this).get(0).isIdentity, label: $(this)[0].label, address : $(this)[0].key.address || address.toString(), keyData : hd || $(this)[0].key.private, network: addressNetwork || $(this)[0].key.network.name }
            payload.rows.push(obj)
            if (verbose) console.log(obj)
  
        }).promise().done(function () { return cb(payload) })
    })
}

function generateMnemonic(password, callback) {
    var mnemonic = new Mnemonic().toString()
    return CryptoJS.AES.encrypt(mnemonic, password).toString()
}

function getMyMnemonic(password, cb) {
    newtables.settings.getOrDefault("mnemonic",generateMnemonic(password,function(encrypted){return encrypted}), function(err, data) { //Get mnemonic or insert an encrypted new one
        try {
            if (data.ok) { //create was good, lets get it now
                newtables.settings.get("mnemonic",function(err, data){
                    var decrypted = decrypt(data.value, password)
                    return cb(new Mnemonic(decrypted))
                })
            } else {
                var decrypted = decrypt(data.value, password)            
                return cb(new Mnemonic(decrypted))
            }
        } catch(e) {return cb({error: "Error decrypting mnemonic", detail: e})}
    })
}

function getChainIdsFromAvailableNetworks(cb) {
    var networks = bitcore.Networks.AvailableNetworks
    var chainIds = []; 
    $.each(networks, function(key, value){
        chainIds.push({name: value.name, id: key, alias: value.alias, url: value.insight.url})
        if (key+1 === networks.length) {
            return cb(chainIds)
        }
     })
}

function getChainIDByName(name, cb) {
    getChainIdsFromAvailableNetworks(function(chainIds){
        var filtered = chainIds.filter(function(item) {return item.name === name})
        return cb(filtered[0].id)
    })    
}

function getCurrentChainId(cb) {
    var contextNetworkName = bitcore.Networks.defaultNetwork.name
    if (contextNetworkName === "livenet") {contextNetworkName = "bitcoin"}
    getChainIdsFromAvailableNetworks(function(chainIds){
        var filtered = chainIds.filter(function(item) {return item.name === contextNetworkName})
        return cb(filtered[0].id)
    })    
}

function getCurrentChainKeys(cb) {
    newtables.privkey.allRecordsArray(function(obj){
        var contextNetworkName = bitcore.Networks.defaultNetwork.name
        var filtered = obj.filter(function(item) {return item.key.network.name === contextNetworkName})        
        return cb(filtered)
    })
}

function getCurrentChainKeyCount(cb) {
    getCurrentChainKeys(function(keys){
        return cb(keys.length)
    })
}

function buildDerivationPathByName(name, cb) {
    //hdPrivateKey.derive("m/44'/0'/0'/0/1337");
    //m / purpose' / coin_type' / account' / change / address_index
    var prefix, coinType, account, change, index
    prefix = "m/44'"
    account = "/0'"
    change = "/0"
    getCurrentChainId(function(id){
        coinType = "/"+id + "'"
        getCurrentChainKeyCount(function(keyCount){
            index = "/"+keyCount
            return cb(prefix + coinType + account + change + index)
        })
    })    
}

function buildCurrentDerivationPath(cb) {
    var contextNetworkName = bitcore.Networks.defaultNetwork.name
    buildDerivationPathByName(contextNetworkName, function(path){
        return cb(path)
    })
}

function getPublicIdentity(cb) {
    var payload = {}
    var getSetting = function(setting, cb) {
        newtables.settings.getOrDefault(setting,"", function(err, data) {
            return cb(data)
        })
    }
    
    $.when(getSetting("profileImage", function (image) {
        payload.photo = image.value
        if (verbose) console.log(image)
    })).then(getSetting("name", function (name) {
        payload.name = name.value
        if (verbose) console.log(name)
    })).then(getSetting("email", function (email) {
        payload.email = email.value
        if (verbose) console.log(email)
    })).then(getSetting("nickname", function (nickname) {
        payload.nickname = nickname.value
        if (verbose) console.log(nickname)
    })).then(getSetting("social", function (social) {
        payload.social = social.value
        if (verbose) console.log(social)
    })).then(getSetting("bio", function (bio) {
        payload.bio = bio.value
        if (verbose) console.log(bio)
        return cb(payload)
    }))
}

function simple(out) {
    if (verbose) console.log(out)
    return out
}
function simple(err, out) {
    if (verbose) console.log(err, out)
    return out
}

function databaseDebug(state) {
    if (state === undefined) state = true;
    if (!state) {
        PouchDB.debug.disable()
    } else {
        PouchDB.debug.enable('*');
    }
}

