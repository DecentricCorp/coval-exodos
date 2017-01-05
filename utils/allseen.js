var levelup = require('level')
var fs = require('fs')
var db = levelup(process.argv[2] || process.env.ParserDir || '../txs')
var utils = require('./utils.js')
var fileToWrite = process.argv[2] || './data/allseen.json'
var allAddresses = new Array()
var bar = utils.genProgressBar(5000000, "Processing Transactions")
db.createReadStream()
    .on('data', function(data) {
        var pieces = data.key.split('-')
        var address = pieces[1]
        var txid = pieces[3]
        var activity = data.value.split(':')[0]      

        var addressJson = {
            address: address,
            txid: txid,
            total: activity
        }
        bar.tick()
        if (data.key.indexOf('txa2-') > -1) {
            allAddresses.push(addressJson)
        }
    })
    .on('close', function() {
        allAddresses.sort(utils.sort_by('total', false, parseInt))
        utils.write(allAddresses, fileToWrite)
        db.close()
    })
