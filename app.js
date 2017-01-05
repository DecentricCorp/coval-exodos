/* 
 * Dependencies
 */
var express = require('express'),
  path = require('path'),
  fs = require('fs'),
  http = require('http'),
  exphbs = require('express3-handlebars'),
  lessMiddleware = require('less-middleware'),
  utils = require('./utils/utils.js'),
  getBalance = require('./utils/dbUtils.js')


/*
 * Initiate Express
 */
var app = express()

/* 
 * App Configurations
 */
app.configure(function() {
  app.set('port', process.env.PORT || 5000);

  app.set('views', __dirname + '/views');

  app.set('view engine', 'html');
  app.engine('html', exphbs({
    defaultLayout: 'main',
    extname: '.html'
    //helpers: helpers
  }));
  //app.enable('view cache');

  app.use(lessMiddleware({
    src: __dirname + '/public',
    compress: true,
    sourceMap: true
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'coval.c-wallet')));

  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.logger('dev')); 
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
* Route for Index
*/
app.get('/', function(req, res) {
  res.render('index');
})

app.get('/explorer', function(req, res) {
  res.sendfile('views/index.html');
})

app.get('/wallet', function(req, res) {
  res.sendfile('templates/manage.html');
})

app.get('/templates/:page', function(req, res) {
  var page = req.params.page
  res.sendfile('templates/'+page);
})

app.get('/templates/emailPasswordForm.html', function(req, res) {
  res.sendfile('templates/emailPasswordForm.html');
})

/*
 * Routes for Robots/404
 */
app.get('/robots.txt', function(req, res) {
  fs.readFile(__dirname + "/robots.txt", function(err, data) {
    res.header('Content-Type', 'text/plain');
    res.send(data);
  });
});

app.get('/json', function (req, res) {
  utils.read('./utils/data/rich.json', function(data){
    res.json(data)
  })
})

app.get('/tx', function (req, res) {
  var addr = req.query.addr
  getBalance(addr, false, false, function(balance){
    res.json(balance)
  })
})

app.get('/api/addr/:addr/balance', function(req, res){
  var addr = req.params.addr
  getBalance(addr, false, false, function(balance){
    balance.total = balance.total / 0.00000001
    res.json(balance.total)
  })
})

//ToDo
app.post('/api/addrs/utxo', function(req, res){
  var addrs = req.body.addrs
  console.log(addrs)  
  res.json([])
})

//ToDo
app.get('/api/txs', function(req, res){
  var address = req.query.address
  //console.log(address)  
  getBalance(address, false, false, function(balance){
    //balance.total = balance.total / 0.00000001
    res.json(balance)
  })
  //res.json({txs: []})
})

app.get('*', function(req, res) {
  res.render('404');
});


http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});
