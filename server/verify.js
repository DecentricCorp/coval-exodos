var fs = require('fs')
var haystack
var Message = require('bitcore-message')
var multi = require('bitcore-explorers-multi')
var notFoundJson = { balance: 0, lastActivity: 1469934350, txCount: 0, error: "Address not found"}



function verify(swapRequest, cb) {
    getJson(function(accounts){
        haystack = accounts.data
        serverVerify(swapRequest, function(result){           
            return cb(result)
        })
    })
}

function getObjectFromDataStore(payload, cb) {
    notFoundJson.address = payload.coval.covalAddress
    var filtered = haystack.filter(function(row){return row.address === payload.coval.covalAddress})[0]
    return cb(filtered || notFoundJson)
}


function serverVerify(finalSwap, cb){
    finalSwap.SwapSignatures.forEach(function(payload){
        var collector = {}
        collector.pass = function() {
            return this.verifyLegacy.valid && this.payloadMatch.valid && this.correctBalance.valid
        }
        verifyLegacySignature(payload, function(valid){
            if (valid) {
                collector.verifyLegacy = {valid: true}                
            } else {
                collector.verifyLegacy = {valid: false, msg: "Legacy payload signature failure"}
            }
            return performPayloadCheck(payload, collector, cb)
        })

        function performPayloadCheck(payload, collector, cb){
            verifyProvidedPayloadMatchesGenerated(payload, function(match){                    
                if (match) {
                    collector.payloadMatch = {valid: true}                                              
                } else {
                    collector.payloadMatch = {valid: false, msg: "Provided string to sign does not match generated."}
                }
                return preformBalanceCheck(payload, collector, cb)
            })
        }
        function preformBalanceCheck(payload, collector, cb){
            verifyProvidedBalanceIsAccurate(payload, function(correctBalance){
                if (correctBalance) {
                    collector.correctBalance = {valid: true}                                
                    return cb(collector)
                } else {
                    collector.correctBalance = {valid: false, msg: "Supplied balance doesn't match database"}
                    return cb(collector)
                }
            })  
        }
    })
}


function verifyProvidedBalanceIsAccurate(payload, cb) {
    getObjectFromDataStore(payload, function(record){
        var valid = payload.coval.swap.balance === record.balance && payload.coval.swap.lastActivity === record.lastActivity
        return cb(valid)
    })    
}

function getJson(cb){    
    var obj = JSON.parse(fs.readFileSync('../utils/data/rich.json', 'utf8'))
    return cb(obj)
}


function verifyProvidedPayloadMatchesGenerated(payload, cb){
    return cb(payload.coval.covalAddress + payload.coval.swap.balance + payload.coval.swap.lastActivity === payload.coval.toSign)
}

function verifyLegacySignature(payload, cb) {
    verifyMessage(payload.coval.toSign, payload.coval.covalAddress, payload.coval.signature, function(valid,err){
        if (!err) {
            return cb(true)
        } else {
            return cb(false)
        }
    })
}

function verifyMessage(msg, address, signature, cb) {
    var message = new Message(msg)
    var valid = message.verify(address, signature)
    if (!valid) {
        return cb(false, {msg: "not a valid signature"})
    }
    return cb(true, null)
}

module.exports.verify = verify