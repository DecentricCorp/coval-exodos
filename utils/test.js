var load = require('soop').load
var env = require("dotenv")
env.load()
var txdb = require('../node_modules/insight-bitcore-api/lib/TransactionDb.js')

var tx = new txdb()
test()
function test() {
    var zeroBalance = "RYqv7BBxiUiLHAv9RZF7LXbiq9YDjVM6rX"
    var singlePositive = "RmZgrjFUEfkexFGzrhf37khYzcbEd45n6R"
    var multiplePartial = "RssL8yT3S1JwvQ52Un2f28aLbeGVFP3SEd"
    var manyWithPositive = "RtxqJoeLDDZEa2UVCuDpSVhhmRkGyzarPU"
    var preMine = "RjpPNAWJhqBEgkkeaeFXD4JfScKVPR67Fi"
    var weird = "Raob1wQyA9FizdBU6JaWTpBGsf4uCMM4mD"
    getBalance(zeroBalance, "Zero Balance")
    getBalance(singlePositive, "Single Positive")
    getBalance(multiplePartial, "Multiple Partial")
    getBalance(manyWithPositive, "Many With Positive")
    getBalance(preMine, "Premine", false)
    getBalance(weird, "Bugfix", false)
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
        filtered = data.filter(function(tx){return tx.spentIndex === undefined})
        filtered.forEach(function(tx){
            //var time = moment.unix(tx.ts)
            //var timeFormatted = time.format('MMMM Do YYYY, h:mm:ss a')
            lastActivity = tx.ts
            //if (time.isBefore(cutoff)) {                
                total += tx.value_sat * 0.00000001    
                          
            //}
            cnt++
        })
        //if (total > 0.1) total = bignum(total).toString()
        console.log(total)
        if (cb) return cb({total: total, lastActivity: lastActivity, txCount: cnt})
        return console.log(msg, addr, {total: total, lastActivity: lastActivity, txCount: cnt})
    })
}
module.exports = getBalance