
function makeBurnTx(address, key, cb) {
    var total = 0
    var transaction = new bitcore.Transaction()
    insight.getUnspentUtxos(address, function(err, utxo){
        utxo.forEach(function(out, index){
            transaction.from(out)
            total += out.satoshis
            if (index === utxo.length -1) {
                // Fee
                transaction._fee = transaction._estimateFee()
                // Sweep 
                var sweepAmount = total - transaction._fee
                var burnScript = bitcore.Script.buildDataOut("BURN")
                var burnOutput = new bitcore.Transaction.Output({script: burnScript, satoshis: sweepAmount })
                transaction.addOutput(burnOutput)
                // Sign
                transaction.sign(key)
                transaction.isFullySigned()
                return cb(transaction)
            }
        })
        
    }) 
}
function broadcast(tx) {
    insight.broadcast(tx, function(a,b){console.log(a,b)})
}
var tx
makeBurnTx("RcjbSHVpqDiK6uNLtLd6EGPjE1WxTmq1bs", "ada6ad8a8876ece82a89032bc5c5f6d52218f12a7e058c06c1458f0737f522be", function(_tx){
    tx = _tx
    _tx.isFullySigned()
})
