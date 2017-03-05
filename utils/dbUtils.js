var load = require('soop').load
var env = require("dotenv")
//var moment = require('moment')
//var cutoff = moment.unix("1469969659")
//var bignum = require('bignum')
env.load()
var txdb = require('../node_modules/insight-bitcore-api/lib/TransactionDb.js')

var tx = new txdb()
function test() {
    var zeroBalance = "RYqv7BBxiUiLHAv9RZF7LXbiq9YDjVM6rX"
    var singlePositive = "RmZgrjFUEfkexFGzrhf37khYzcbEd45n6R"
    var multiplePartial = "RssL8yT3S1JwvQ52Un2f28aLbeGVFP3SEd"
    var manyWithPositive = "RtxqJoeLDDZEa2UVCuDpSVhhmRkGyzarPU"
    var preMine = "RjpPNAWJhqBEgkkeaeFXD4JfScKVPR67Fi"
    getBalance(zeroBalance, "Zero Balance")
    getBalance(singlePositive, "Single Positive")
    getBalance(multiplePartial, "Multiple Partial")
    getBalance(manyWithPositive, "Many With Positive")
    getBalance(preMine, "Premine", false)
}
function getBalance(addr, msg, showData, cb){
    tx.fromAddr(addr, {}, function(err, data){
        if (showData) {
            console.log("DATA", data)
            data.forEach(function(_tx){
                console.log(_tx.txid)
            })
        }
        var total = 0
        var lastActivity = 0
        var cnt = 0
        var txs = []
        filtered = data.filter(function(tx){return tx.spentIndex === undefined})
        filtered.forEach(function(tx){
            //var time = moment.unix(tx.ts)
            //var timeFormatted = time.format('MMMM Do YYYY, h:mm:ss a')
            //lastActivity = timeFormatted
            lastActivity = tx.ts
            total += tx.value_sat * 0.00000001
            txs[txs.length] = tx
            cnt++
        })        
        //if (total > 0 )total = bignum(total).toString()        
        if (cb) return cb({total: total, lastActivity: lastActivity, txCount: cnt, txs: txs})
        return console.log(msg, addr, {total: total, lastActivity: lastActivity, txCount: cnt, txs: txs})
    })
}
//test()
module.exports = getBalance