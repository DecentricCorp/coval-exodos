var levelup = require('level')
var fs = require('fs')
var db = levelup(process.argv[2] || process.env.ParserDir || '../txs')
var utils = require('./utils.js')
var fileToWrite = process.argv[2] || './data/alltx.json'
var allWithActivity = new Array()
var bar = utils.genProgressBar(50000000, "Processing Transactions")
db.createReadStream()
    .on('data', function(data) {
        var pieces = data.key.split('-')
        var address = pieces[1]
        var txid = pieces[3]
        var activity = data.value.split(":")[0] 

        var addressJson = {
            address: address,
            txid: txid,
            total: activity
        }
        bar.tick()
        /*if (addressJson.address == "RjpPNAWJhqBEgkkeaeFXD4JfScKVPR67Fi"  || addressJson.address === "RjpPNAWJhqBEgkkeaeFXD4JfScKVPR67Fi") {
            console.log(addressJson)
        }*/
        if (activity > 0 && address.length == 34) {
            allWithActivity.push(addressJson)
        }
    })
    .on('close', function() {
        allWithActivity.sort(utils.sort_by('total', false, parseInt))
        utils.write(allWithActivity, fileToWrite)
        db.close()
    })