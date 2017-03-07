rm filelog-info.log
rm filelog-ledger.log
NOW=date
curl https://coval-exodos-verify.mybluemix.net/backup/?limit=10000 >> ../log-backup/default.json 
curl https://coval-exodos-verify.mybluemix.net/logs/ledger?limit=10000 >> ../log-backup/ledger.json 
cf push coval-exodos-verify -c "node server.js"
