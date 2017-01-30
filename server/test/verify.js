var assert = require('chai').assert
//var assert = require('assert')
var verify = require('../verify.js').verify

//Test sigs
var singleValidSwapRequest = {"CounterpartyAddress":"19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM","SwapSignatures":[{"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs01469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}],"A_TotalOfBalances":0,"B_BonusAmount":0,"C_TotalSwapRequested":0,"PassedSignatureChecks":true}

var multipleValidSwapRequests = {"CounterpartyAddress":"19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM","SwapSignatures":[{"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs01469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}, {"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs01469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}],"A_TotalOfBalances":0,"B_BonusAmount":0,"C_TotalSwapRequested":0,"PassedSignatureChecks":true}

var singleInvalidPayload = {"CounterpartyAddress":"19cCGRb5XLuuzoRvDLyRm888G8ank5WFyM","SwapSignatures":[{"coval":{"toSign":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs751469934350","covalAddress":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","signature":"IAox24VyWPfkCbj7CumuNRdxKRT0NtXeAPcHl7FhLzGNXhVF9CbPBBEumZalaMqsO0loTBmR6Unq1iDfqamhSRE=","swap":{"address":"RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs","balance":0,"lastActivity":1469934350,"error":"Address not found"}},"contract":{"signerAddress":"0x449d6a20df5825d49f1b0b996139308d50fe5ef9","signatureVersion":28,"signatureR":"0x1d5092d748084fb4fe922d7df1dccc138d74c73b72858c7843cc4a7752db4cd3","signatureS":"0x515d0062891649f4d64b6242c70a4a87fed77272211e9c27b9cd59cec9f8bd9e"}}],"A_TotalOfBalances":0,"B_BonusAmount":0,"C_TotalSwapRequested":0,"PassedSignatureChecks":true}



describe('Swap', function() {
  describe('Valid single swap request', function() {    
        var testResult = false
        beforeEach(function(){
            verify(multipleValidSwapRequests, function(result){
                //console.log(result)
                testResult = result
            })
        })
        it('should pass all tests', function() {    
            assert.isTrue(testResult.pass())
        })
        it('should verify legacy signature', function() {    
            assert.isTrue(testResult.verifyLegacy.valid)
        })
        it('should verify supplied payload match server side generated payload', function() {    
            assert.isTrue(testResult.payloadMatch.valid)
        })
        it('should verify supplied balance matches serverside balance', function() {    
            assert.isTrue(testResult.correctBalance.valid)
        })
    })
    describe('Valid multiple swap requests', function() {    
        var testResults = []
        beforeEach(function(){
            verify(multipleValidSwapRequests, function(result){
                testResults[testResults.length] = result
            })
        })
        it('should contain 2 ', function() {    
            assert.lengthOf(testResults, 2)
        })
        it('should all pass all tests', function() {    
            assert.isTrue(testResults[0].pass() )
            assert.isTrue(testResults[1].pass() )
        })
        it('should verify legacy signatures', function() {    
            assert.isTrue(testResults[0].verifyLegacy.valid)
            assert.isTrue(testResults[1].verifyLegacy.valid)
        })
        it('should verify supplied payloads match server side generated payloads', function() {    
            assert.isTrue(testResults[0].payloadMatch.valid)
            assert.isTrue(testResults[1].payloadMatch.valid)
        })
        it('should verify supplied balances matches serverside balances', function() {    
            assert.isTrue(testResults[0].correctBalance.valid)
            assert.isTrue(testResults[1].correctBalance.valid)
        })
    })
    describe('Invalid payload', function() {    
        var testResult = false
        beforeEach(function(){
            verify(singleInvalidPayload, function(result){
                console.log(result)
                testResult = result
            })
        })
        it('should not pass all tests', function() {    
            assert.isFalse(testResult.pass())
        })
        it('should flag invalid payload', function() {    
            assert.isFalse(testResult.payloadMatch.valid)
        })
        it('should flag invalid legacy signature', function() {    
            assert.isFalse(testResult.verifyLegacy.valid)
        })
    })
  })