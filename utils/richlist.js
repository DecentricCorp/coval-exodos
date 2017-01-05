var getBalance = require('./dbUtils.js')
var utils = require('./utils.js')
var fs = require('fs')
var json2csv = require('json2csv')
var addressArray = []
var balanceArray = []
var fileToParse = process.argv[2] || './data/alltx.json'
var fileToWrite = process.argv[3] || './data/rich.json'
var fileToCSV = process.argv[4] || './data/rich.csv'


console.log("Parsing ",fileToParse)

var parseFile = function(fileName,callback) {
	var obj = JSON.parse(fs.readFileSync(fileName, 'utf8'));
	var bar = utils.genProgressBar(obj.length, "Processing "+fileName)

	for (var index = 0; index < obj.length; index++) {
		var address = obj[index]
		var type = "tx"
		bar.tick()
		var addressObj = address.address
		if (Number(address.total) < 1 ) {
			type = "reward"
		}
		addressArray.push(addressObj)
		
		if (index == obj.length-1) {
			return callback(addressArray.unique())
		}
	}
}

var _getBalance = function(addresses, index, bar, callback) {
	bar.tick()
	if (index == addresses.length) {
		return callback()
	}
	getBalance(addresses[index], false, false, function(balance){
		//console.log(balance, addresses[index])
		if (balance.total > 0) {
			var obj = {address: addresses[index], balance: balance.total, lastActivity: balance.lastActivity, txCount: balance.txCount, type: addresses[index].type }
			balanceArray.push(obj)
		}
		return _getBalance(addresses, index+1, bar, callback)
	})
}

parseFile(fileToParse ,function(addresses){
	var bar = utils.genProgressBar(addresses.length, "Processing addresses")	
	_getBalance(addresses, 0, bar, function(){
		var payload = balanceArray.sort(utils.sort_by('balance', true, parseInt))
		
		utils.write({data: payload}, fileToWrite) 
		var fields = ['address','balance', 'lastActivity', 'txCount']
		var opts = {
			data: payload,
			fields: fields,
			quotes: ''
		}
		var csv = json2csv(opts)
		utils.write(csv, fileToCSV)
	})
})