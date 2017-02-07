var express = require('express')
var app = express()
var verify = require('./lib/verify.js').verify
var verifyLogger = require('./lib/verify.js').setLogger
var loggerPlugin = require('./lib/logger.js')

var bodyParser = require('body-parser')
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))


//Test sigs
var singleValidSwapRequest = {"CounterpartyAddress":"19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM","SwapSignatures":[{"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs01469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}],"A_TotalOfBalances":0,"B_BonusAmount":0,"C_TotalSwapRequested":0,"PassedSignatureChecks":true}

var multipleValidSwapRequests = {"CounterpartyAddress":"19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM","SwapSignatures":[{"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs01469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}, {"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs01469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}],"A_TotalOfBalances":0,"B_BonusAmount":0,"C_TotalSwapRequested":0,"PassedSignatureChecks":true}

var singleInvalidPayload = {"CounterpartyAddress":"19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM","SwapSignatures":[{"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs751469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}],"A_TotalOfBalances":0,"B_BonusAmount":0,"C_TotalSwapRequested":0,"PassedSignatureChecks":true}



app.set('json spaces', 4)

/* Logging plugin */
var appLogger = loggerPlugin(app)
app = appLogger.app
var logger = appLogger.defaultLogger
var ledgerLogger = appLogger.ledgerLogger

verifyLogger(ledgerLogger)

app.get('/', function(req, res){
    res.json({createdBy: "Shannon Code", title: "Coval Server Swap Verification"})
})

app.get('/v1/test/', function(req, res){
    var version = Number(req.query.version) || 1
    var testSet
    switch(version) {
        case 1:
            testSet = {set: singleValidSwapRequest, name: "single valid"}
        break
        case 2:
            testSet = {set: multipleValidSwapRequests, name: "multiple valid"}
        break
        case 3: 
            testSet = {set: singleInvalidPayload, name: "single invalid"}
        break
    }     
    performExpressSafeVerification(testSet.set, function(results){
        results.name = testSet.name
        return res.json(results)
    }) 
})

app.post('/v1/verify/', function(req, res){
    var payload = req.body.payload
    if (!payload) {
        ledgerLogger.ledger("payload error")
        return res.json({success: false, error: "payload error"})
    }
    //return res.json(payload || {success: false, error: "bad payload"})
    ledgerLogger.debug("entering performExpressSafe...")
    performExpressSafeVerification(payload, function(results){
        return res.json(results || {success: false, error: "unknown"})
    }) 
})

function performExpressSafeVerification(swapSet, cb){
    var results = []
    ledgerLogger.ledger("Entering verify")
    verify(swapSet, function(result){        
        results[results.length] = result
        if (results.length === swapSet.SwapSignatures.length) {
            ledgerLogger.ledger("entering testPass")
            testPass(results, function(success){
                return cb({pass: success, result: results})
            })            
        }
    })
}

function testPass(results, cb) {
    var count = 0
    results.forEach(function(result){
        if (!result.pass()) {            
            return cb(false)
        }
        count += 1        
    })
    if (count === results.length) {
        return cb(true)
    }
}

var port = process.argv[2] || process.env.PORT || 4701

global.app = app

// Only run when application is executed
// Don't run in tests, where application is imported
if (!module.parent) {
  //app.listen(port)
  app.listen(port);
}

console.log('API running at http://localhost:' + port)

module.exports = app