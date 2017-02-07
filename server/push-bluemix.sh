rm filelog-info.log
rm filelog-ledger.log
cf push coval-exodos-verify -c "node server.js"
