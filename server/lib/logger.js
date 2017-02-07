    var winston = require('winston'),
        expressWinston = require('express-winston')

    /* Whitelist */
    var routeWhitelist = ['/v1', '/v1.5', '/auth', '/logs']  
        
    var factory = function(app){
        var defaultLogger = makeLogger("default")
        var ledgerLogger = makeLogger("ledger")
        var options = { meta: true,  winstonInstance : defaultLogger, logstash: true }
            options.ignoreRoute = function (req, res) {
                if (req.url.indexOf("/v1") > -1) {
                    return false
                } else {
                    return true
                }
            }
            options.requestWhitelist = ['url', 'originalUrl', 'query']
            options.responseWhitelist = ['body']
            options.responseBlacklist = ['message']

        loggerInstance = expressWinston.logger(options)

        app.use(loggerInstance)
        app.get('/logs/:type?', function(req, res){
            var logger = defaultLogger
            var logType = req.params.type || "default"
            var options = {    
                limit: req.query.limit|| 10,
                start: req.query.start || 0,
                order: req.query.order || 'desc',
                meta: false
            }
            switch (logType) {
                case "default":
                logger = defaultLogger
                break
                case "ledger":
                logger = ledgerLogger
                break
            }      
            logger.query(options, function (err, results) {
                if (err) {
                throw err;
                }
                res.json(results)
            })
        })
        return {app: app, defaultLogger: loggerInstance, ledgerLogger: ledgerLogger}
}
function makeLogger(loggerType) {
    var logger = new (winston.Logger)({
        levels: getLevels(loggerType),
        transports: getTransports(loggerType),
        exceptionHandlers: getTransports("exception"),
        exitOnError: false
    })
    return logger
}
function getTransports(loggerType) {
    var transports = []
    switch(loggerType) {
        case "default":
            transports[transports.length] = new (winston.transports.File)({ name: 'info-log', filename: 'filelog-info.log', level: 'info' })
        break
        case "exception":
            transports[transports.length] = new (winston.transports.File)({ name: 'error-log', filename: 'filelog-error.log', handleExceptions: true, level: 'error' })
        break
        case "ledger":
            transports[transports.length] = new (winston.transports.File)({ name: 'ledger-log', filename: 'filelog-ledger.log', level: 'block' })
        break                    
    }
    return transports
}

function getLevels(loggerType) {
    var levels = {}
    switch(loggerType) {
        case "default":
            levels = {error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5}
        break
        case "ledger":
            levels = {ledger: 0, api: 1, event: 2, token: 3, block: 4, debug: 5}
        break
    }
    return levels
}
function shouldIgnore(url, routeWhitelist, cb){
	 var allowed = true
	 routeWhitelist.forEach(function(item, index){
		if (allowed) {
            var poi = url.indexOf(item) > -1
            if (poi || routeWhitelist.length === index+1) {
                allowed = false
                return cb(!poi)
            }	
        }	
    })
}
module.exports = factory