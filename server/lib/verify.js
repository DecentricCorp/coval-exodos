var fs = require('fs')
var haystack
var bitcore = require('bitcore')
var Message = require('bitcore-message')
var multi = require('bitcore-explorers-multi')
var insight = new multi.Insight()
var notFoundJson = { balance: 0, lastActivity: 1469934350, txCount: 0, error: "Address not found"}
var shouldBurn = false
var logger

function setLogger(_logger) {
    logger = _logger
    logger.ledger("Logger set inside verify")
}
function verify(swapRequest, cb) {
    logger.ledger("inside verify")
    logger.ledger("entering getjson")
    getJson(function(accounts){
        logger.ledger(" getjson return")
        haystack = accounts.data
        logger.ledger("entering server verify")
        serverVerify(swapRequest, function(result){    
            logger.ledger("server verify retuirn")       
            return cb(result)
        })
    })
}

function getObjectFromDataStore(payload, cb) {
    logger.ledger("get object from datastore")
    notFoundJson.address = payload.coval.covalAddress
    var filtered = haystack.filter(function(row){return row.address === payload.coval.covalAddress})[0]
    return cb(filtered || notFoundJson)
}


function serverVerify(finalSwap, cb){
    logger.ledger("inside server verify")
    //finalSwap.SwapSignatures.forEach(function(payload){
    var collector = []
    function performSingleServerVerify(finalSwap, index, cb) {
        var payload = finalSwap.SwapSignatures[index]
        console.log("inside loop #", index)
        collector[index] = {}
        collector[index].pass = function() {
            return this.verifyLegacy.valid && this.payloadMatch.valid && this.correctBalance.valid
        }
        verifyLegacySignature(payload, function(valid){
            console.log("inside verifyLegacySignature #", index)
            if (valid) {
                collector[index].verifyLegacy = {valid: true}                
            } else {
                collector[index].verifyLegacy = {valid: false, msg: "Legacy payload signature failure"}
            }
            return performPayloadCheck(payload, collector, cb)
        })

        function performPayloadCheck(payload, collector, cb){
            verifyProvidedPayloadMatchesGenerated(payload, function(match){   
                console.log("inside verifyProvidedPayloadMatchesGenerated #", index)                 
                if (match) {
                    collector[index].payloadMatch = {valid: true}                                              
                } else {
                    collector[index].payloadMatch = {valid: false, msg: "Provided string to sign does not match generated."}
                }
                return preformBalanceCheck(payload, collector, cb)
            })
        }
        function preformBalanceCheck(payload, collector, cb){
            verifyProvidedBalanceIsAccurate(payload, function(correctBalance){
                console.log("inside verifyProvidedBalanceIsAccurate #", index)
                if (correctBalance) {
                    collector[index].correctBalance = {valid: true}   
                    console.log("ifTrue correctBalance #", index, collector[index].correctBalance)                             
                    //return cb(collector)
                } else {
                    console.log("else correctBalance #", index, collector[index].correctBalance)    
                    collector[index].correctBalance = {valid: false, msg: "Supplied balance doesn't match database"}
                    //return cb(collector)
                }
                return performBurnTxCheck(payload, collector, cb)
            })  
        }
        function performBurnTxCheck(payload, collector, cb) {
            console.log("outside verifyValidBurn #", index)  
            verifyValidBurn(payload, function(validBurn){
                console.log("inside verifyValidBurn #", index)  
                if (validBurn) {
                    collector[index].burnSigned = {valid: true}                                
                    //return cb(collector)
                } else {
                    collector[index].burnSigned = {valid: false, msg: "Burn transaction not fully signed"}
                    //return cb(collector)
                }
                return performDoubleSpendCheck(payload, collector, cb)
            })
        }
        function performDoubleSpendCheck(payload, collector, cb) {
            verifyNotDoubleSpend(payload, function(notDoubleSpend){
                console.log("inside verifyNotDoubleSpend #", index)  
                if (notDoubleSpend) {
                    collector[index].notDoubleSpend = {valid: true}
                } else {
                    collector[index].notDoubleSpend = {valid: false, msg: "Burn transaction appears to be attempting to doublespend"}
                }
                if (shouldBurn) {
                    return performBurnSend(payload, collector, cb)
                } else {
                    return finalize()
                }         
            })
        }
        function performBurnSend(payload, collector, cb){
            console.log("inside performBurn")
            try {
                sendBurn(payload, function(err, txid){
                    console.log("performed Burn", err, txid)
                    if (!err) {
                        collector[index].burnTransaction = {txid: txid}
                    } else {
                        collector[index].burnTransaction = {txid: 0, msg: "Error sending transaction "+ err}
                    }
                    console.log("Done?", finalSwap.SwapSignatures.length-1, index)
                    return finalize()
                })
            } catch (err){
                collector[index].burnTransaction = {txid: 0, msg: "Error sending transaction "+ err}
                return finalize()
            }        
        }
        function finalize(){
            if (finalSwap.SwapSignatures.length-1 != index) {
                console.log("Loop")
                index += 1
                performSingleServerVerify(finalSwap, index, cb)
            } else {
                console.log("No need to loop")
                return cb(collector)
            }
        }
    }    
    performSingleServerVerify(finalSwap, 0, cb)
}

function sendBurn(payload, cb){
    var burnTx = new bitcore.Transaction(payload.coval.burn)
    if (burnTx.inputs.length < 1) {
        return cb("No inputs in burn transaction (likely a zero balance)")
    } else {
        insight.broadcast(burnTx, function(err, txid){
            return cb(err, txid)
        })
    }
}

function verifyNotDoubleSpend(payload, cb){
    logger.ledger("inside verifyNotDoubleSpend")
    logger.ledger("address"+payload.coval.covalAddress)
    logger.ledger("payload",payload.coval)
    var address = payload.coval.covalAddress    
    var burnTx = new bitcore.Transaction(payload.coval.burn)
    if (burnTx.inputs.length > 0) {
        logger.ledger("burntx"+burnTx)
        var balance, pending, total 
        try {
            insight.requestGet("/api/addr/"+address+"/balance", function(err,result){
                if (err) {logger.ledger("ERR: " + err)}
                logger.ledger("confirmed Response: " +  JSON.stringify(result))
                balance = Number(result.body)
                total = balance
                insight.requestGet("/api/addr/"+address+"/unconfirmedBalance", function(err,result){
                    if (err) {logger.ledger("ERR: " + err)}
                    logger.ledger("unconfirmed Response: " + JSON.stringify(result))
                    pending = Number(result.body)
                    total += pending
                    logger.ledger("Amounts : " + burnTx._getInputAmount(), total)
                    var notDoubleSpend = burnTx._getInputAmount() === total
                    return cb(notDoubleSpend)
                })
            })
        } catch (err) {
            logger.ledger("ERR", err)
            return cb(false)
        }
    } else {
        logger.ledger("burntx had no inputs")
        return cb(true)
    }
}

function verifyValidBurn(payload, cb) {
    logger.ledger("inside verifyValidBurn")
    console.log("inside verifyValidBurn", payload.coval.burn)
    try {
        var burnTx = new bitcore.Transaction(JSON.parse(payload.coval.burn))
    } catch (err){
        console.log("ERROR :(", err)
    }
    console.log("BURN TX", burnTx)
    var isSigned = burnTx.isFullySigned()
    console.log("Signed", isSigned)
    return cb(isSigned)
}

function verifyProvidedBalanceIsAccurate(payload, cb) {
    logger.ledger("inside verifyProvidedBalance")
    getObjectFromDataStore(payload, function(record){
        var valid = payload.coval.swap.balance === record.balance && payload.coval.swap.lastActivity === record.lastActivity
        return cb(valid)
    })    
}

function getJson(cb){
    logger.ledger("inside getJson")
    var obj = JSON.parse(fs.readFileSync('./utils/data/rich.json', 'utf8'))
    return cb(obj)
}


function verifyProvidedPayloadMatchesGenerated(payload, cb){
    logger.ledger("inside verify provided payload")
    return cb(payload.coval.covalAddress + payload.coval.swap.balance + payload.coval.swap.lastActivity + "-test" === payload.coval.toSign)
}

function verifyLegacySignature(payload, cb) {
    logger.ledger("inside verify legacy")
    logger.ledger("entering verify msg")
    verifyMessage(payload.coval.toSign, payload.coval.covalAddress, payload.coval.signature, function(valid,err){
        logger.ledger("verify msg return")
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
module.exports.setLogger = setLogger