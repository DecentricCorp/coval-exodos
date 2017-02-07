var levelup = require('levelup')
var dbPath = process.argv[2] || "./txs"
var s = process.argv[3] || 0;
console.log('DB: ',dbPath) //TODO
var db = levelup(dbPath )

db.createReadStream()
  .on('data', function (data) {
      if (data.key.indexOf('txo-') < 0 && data.key.indexOf('txa') < 0 ) {
        console.log(data.key + ' => ' + data.value); //TODO
      }
  }).on('error', function () {  }).on('end', function () {  })


var levelup = require('levelup')
var dbPath = process.argv[2] || "./nodes"
var s = process.argv[3] || 0;
console.log('DB: ',dbPath) //TODO
var db = levelup(dbPath )

db.createReadStream()
  .on('data', function (data) {
      //if (data.key.indexOf('txo-') < 0 && data.key.indexOf('txa') < 0 ) {
        console.log(data.key + ' => ' + data.value); //TODO
      //}
  }).on('error', function () {  }).on('end', function () {  })


