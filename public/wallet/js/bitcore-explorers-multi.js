require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  models: require('./models'),
  Insight: require('./insight')
};

},{"./insight":2,"./models":4}],2:[function(require,module,exports){
'use strict';

var request = require('request');

var bitcore = require('bitcore');
var _ = bitcore.deps._;

var $ = bitcore.util.preconditions;
var Address = bitcore.Address;
var JSUtil = bitcore.util.js;
var Networks = bitcore.Networks;
var Transaction = bitcore.Transaction;
var UnspentOutput = Transaction.UnspentOutput;
var AddressInfo = require('./models/addressinfo');
var hex = function (hex) { return bitcore.util.buffer.hexToBuffer }
Networks.AvailableNetworks = []

/*Networks.add({ 
    name: "",
    alias: "",
    pubkeyhash: 0x,
    privatekey: ,
    scripthash: 0x,
    xpubkey: 0x,
    xprivkey: 0x,
    genesisBlock: {
        hash: ""
    },
    networkMagic: 0x,
    port: ,
    protocolVersion: ,
    dnsSeeds: ['']
})*/

Networks.add({
    name: "bitcoin",
    alias: "btc",
    pubkeyhash: 0x00,
    privatekey: 0x80,
    scripthash: 0x05,
    xpubkey: 0x0488b21e,
    xprivkey: 0x0488ade4,
    networkMagic: 0xf9beb4d9,
    port: 8333,
    protocolVersion: 70002,
    dnsSeeds: [
        'seed.bitcoin.sipa.be',
        'dnsseed.bluematt.me',
        'dnsseed.bitcoin.dashjr.org',
        'seed.bitcoinstats.com',
        'seed.bitnodes.io',
        'bitseed.xf2.org'
    ],
    genesisBlock: {
        hash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
    }
})

Networks.add({
    name: 'litecoin',
    alias: 'ltc',
    pubkeyhash: 0x30,
    privatekey: 0xB0,
    scripthash: 0x05,
    xpubkey: 0x019da462,
    xprivkey: 0x019d9cfe,
    networkMagic: 0xFBC0B6DB,
    port: 9333,
    protocolVersion: 70003,
    dnsSeeds: [
        'dnsseed.litecointools.com',
        'dnsseed.litecoinpool.org',
        'dnsseed.ltc.xurious.com',
        'dnsseed.koin-project.com',
        'dnsseed.weminemnc.com'
    ],
    genesisBlock: {
        hash: "12a765e31ffd4059bada1e25190f6e98c99d9714d334efa41a195a7e7e04bfe2"
    }    
})

Networks.add({ //Doesn't work with P2P
    name: "neucoin",
    alias: "neu",
    pubkeyhash: 53,
    privatekey: 52,
    scripthash: 112,
    xpubkey: 0x0488b210,
    xprivkey: 0x0488ade5,
    networkMagic: 0xe5cf82de,
    port: 7742,
    protocolVersion: 70002,
    dnsSeeds: [
         "seed-a.neucoin.org",
         "seed-b.neucoin.org",
         "seeds.for.neucoin.org"
    ],
    genesisBlock: {
        hash: "0000091ff3253003c85f4ff7614ce1da7cc6592a5641d5b9f95fde1929bc9754"
    }
})

Networks.add({ //Doesn't work with P2P
    name: "dash",
    alias: "dsh",
    pubkeyhash: 0x4C,
    privatekey: 204,
    scripthash: 0x05,
    xpubkey: 0x0781b71e,
    xprivkey: 0x0781a3e4,
    genesisBlock: {
        hash: "b67a40f3cd5804437a108f105533739c37e6229bc1adcab385140b59fd0f0000"
    },
    networkMagic: 0xbf0c6bbd,
    port: 9999,
    protocolVersion: 70003,
    dnsSeeds: ['192.99.184.51']
})

Networks.add({ //Doesn't work with P2P
    name: "digibyte",
    alias: "dgb",
    pubkeyhash: 30,
    privatekey: 128,
    scripthash: 0x05,
    xpubkey: 0x0488b214,
    xprivkey: 0x0488adef,
    genesisBlock: {
        hash: "0x7497ea1b465eb39f1c8f507bc877078fe016d6fcb6dfad3a64c98dcc6e1e8496"
    },
    networkMagic: 0xfac3b6da,
    port: 12024,
    protocolVersion: 70002,
    dnsSeeds: ["seed1.digibytewiki.com", "seed2.digiexplorer.info", "seed3.digihash.co", "seed4.digibyte.co"]
})

Networks.add({
    name: "defcoin",
    alias: "dfc",
    pubkeyhash: 0x1e,
    privatekey: 158,
    scripthash: 5,
    xpubkey: 0x0488b21f,
    xprivkey: 0x0488ade6,
    genesisBlock: {
        hash: "192047379f33ffd2bbbab3d53b9c4b9e9b72e48f888eadb3dcf57de95a6038ad"
    },
    networkMagic: 0xfbc0b6db,
    port: 1337,
    protocolVersion: 70002,
    dnsSeeds: ["seed.defcoin.org", "seed2.defcoin.org"]
})


Networks.add({
    name: "coval",
    alias: "coval",
    pubkeyhash: 61,
    privatekey: 0xbd,
    scripthash: 123,
    xpubkey: 0x3764724C,
    xprivkey: 0x37642686,
    genesisBlock: {
        hash: "0000f09aa1598d2d5a2ea7eab61153a8e24641da3b8a4f0404f0bebd57f7bc10"
    },
    networkMagic: 0xfaceb5e9,
    protocolVersion: 70001,
    port: 3764,
    dnsSeeds: ["104.131.226.147"]
})

/*Networks.add({
    name: "coval",
    alias: "coval",
    pubkeyhash: 0x00,
    privatekey: 0x80,
    scripthash: 0x05,
    xpubkey: 0x0488b21e,
    xprivkey: 0x0488ade4,
    networkMagic: 0xf9beb4d9,
    port: 3764,
    protocolVersion: 70002,
    genesisBlock: {
        hash: "0000f09aa1598d2d5a2ea7eab61153a8e24641da3b8a4f0404f0bebd57f7bc10"
    }
})*/

Networks.add({
    name: "test-ribbit",
    alias: "trbr",
    pubkeyhash: 65,
    privatekey: 0xef,
    scripthash: 127,
    xpubkey: 0x3765F693,
    xprivkey: 0x37653DE2,
    networkMagic: 0x0c210a17,
    port: 3764,
    dnsSeeds: ["104.131.86.196"]
})

Networks.add({
    name: "ethereum",
    alias: "eth",    
    pubkeyhash: 65,
    privatekey: 0xef,
    scripthash: 127,
    xpubkey: 0x3765F693,
    xprivkey: 0x37653DE2,
    networkMagic: 0x0c210a17,
    port: 3764,
    dnsSeeds: ["127.0.0.1"]
})

Networks.add({
    name: "franko",
    alias: "frk",
    pubkeyhash: 35,
    privatekey: 163,
    scripthash: 5,
    xpubkey: 0x3d,
    xprivkey: 0xbd,
    protocolVersion: 70003,
    genesisBlock: {
        hash: "19225ae90d538561217b5949e98ca4964ac91af39090d1a4407c892293e4f44f"
    },
    networkMagic: 0x7defaced,
    port: 7912,
    dnsSeeds: ["www.exp.life", "www.dirtydiggers.org", "explorer.frankos.org", "46.101.156.249", "74.196.59.25:7999", "74.196.59.25:7912", "54.236.122.39", "188.234.249.148:7912", "162.243.227.221:7912", "66.172.10.118:7912", "37.187.144.36:7912", "84.200.17.181:7912", "94.23.241.56:7912", "209.95.36.136:7912", "62.210.139.65:7912", "157.161.128.58", "75.138.127.31", "193.227.134.111", "38.79.70.254", "104.236.59.76", "45.55.22.34", "104.236.163.203", "46.101.156.249"]
    })
    
    var defaultFees = {
        DUST_AMOUNT:546,
        FEE_SECURITY_MARGIN:15,
        MAX_MONEY:2100000000000000,
        NLOCKTIME_BLOCKHEIGHT_LIMIT:500000000,
        NLOCKTIME_MAX_VALUE:4294967295,
        FEE_PER_KB:10000,
        CHANGE_OUTPUT_MAX_SIZE:62,
        MAXIMUM_EXTRA_SIZE:26
    }
    
    function getLitecoinFees() {
        var fees = {}
        fees.DUST_AMOUNT= 100000
        fees.FEE_SECURITY_MARGIN = defaultFees.FEE_SECURITY_MARGIN
        fees.MAX_MONEY = defaultFees.MAX_MONEY
        fees.NLOCKTIME_BLOCKHEIGHT_LIMIT = defaultFees.NLOCKTIME_BLOCKHEIGHT_LIMIT
        fees.NLOCKTIME_MAX_VALUE = defaultFees.NLOCKTIME_MAX_VALUE
        fees.FEE_PER_KB = 100000   
        fees.CHANGE_OUTPUT_MAX_SIZE = defaultFees.CHANGE_OUTPUT_MAX_SIZE
        fees.MAXIMUM_EXTRA_SIZE = defaultFees.MAXIMUM_EXTRA_SIZE
        return fees
    }

Networks.AvailableNetworks.push({ name: "coval", alias: "coval", display: "Circuits of Value", fees: defaultFees, insight: new Insight("coval") })
//Networks.AvailableNetworks.push({ name: "test-ribbit", fees: defaultFees, insight: new Insight("test-ribbit") })
Networks.AvailableNetworks.push({ name: "bitcoin", alias: "btc", display: "Bitcoin", fees: defaultFees, insight: new Insight("https://insight.bitpay.com") })
//Networks.AvailableNetworks.push({ name: "franko", alias: "frk", display: "Franko", fees: defaultFees, insight: new Insight("franko") })
//Networks.AvailableNetworks.push({ name: "defcoin", alias: "dfc", display: "Defcoin", fees: defaultFees, insight: new Insight("defcoin") })
//Networks.AvailableNetworks.push({ name: "dash", alias: "dash", display: "Dash", fees: defaultFees, insight: new Insight("dash") })
//Networks.AvailableNetworks.push({ name: "neucoin", fees: defaultFees, insight: new Insight("neucoin") })
//Networks.AvailableNetworks.push({ name: "dogecoin", fees: defaultFees, insight: new Insight("dogecoin") })
//Networks.AvailableNetworks.push({ name: "litecoin", alias: "ltc", display: "Litecoin", fees: getLitecoinFees(), insight: new Insight("litecoin") })
Networks.AvailableNetworks.push({ name: "digibyte", alias: "dgb", display: "Digibyte", fees: defaultFees, insight: new Insight("digibyte") })
//Networks.AvailableNetworks.push({ name: "ethereum", alias: "eth", display: "Ethereum", fees: defaultFees, insight: new Insight("ethereum") })

Networks.defaultNetwork = bitcore.Networks.get("coval")
Networks.livenet = bitcore.Networks.get("coval")

Networks.AvailableNetworks.currentNetwork = function () {
    var currentNet = Networks.defaultNetwork.name;
    if (currentNet === "livenet") currentNet = "bitcoin"
    for (var i = 0; i < Networks.AvailableNetworks.length; i++) {
        if (Networks.AvailableNetworks[i].name === currentNet) {
            return Networks.AvailableNetworks[i]
        }
    }
}

Networks.AvailableNetworks.get = function (name) {
    //var currentNet = Networks.defaultNetwork;
    for (var i = 0; i < Networks.AvailableNetworks.length; i++) {
        if (Networks.AvailableNetworks[i].name === name) {
            return Networks.AvailableNetworks[i]
        }
    }
    return Networks.defaultNetwork
}

Networks.AvailableNetworks.set = function (name) {
    if (name === "livenet") { name = "bitcoin" }
    for (var i = 0; i < Networks.AvailableNetworks.length; i++) {
        if (Networks.AvailableNetworks[i].name === name) {
            Networks.defaultNetwork = Networks.AvailableNetworks[i].insight.network
            Networks.livenet = Networks.AvailableNetworks[i].insight.network
            setFees(Networks.AvailableNetworks[i].fees)
            return Networks.defaultNetwork
        }
    }    
}

function setFees(fees) {
    bitcore.Transaction.DUST_AMOUNT = fees.DUST_AMOUNT
    bitcore.Transaction.FEE_SECURITY_MARGIN = fees.FEE_SECURITY_MARGIN
    bitcore.Transaction.MAX_MONEY = fees.MAX_MONEY
    bitcore.Transaction.NLOCKTIME_BLOCKHEIGHT_LIMIT = fees.NLOCKTIME_BLOCKHEIGHT_LIMIT
    bitcore.Transaction.NLOCKTIME_MAX_VALUE = fees.NLOCKTIME_MAX_VALUE
    bitcore.Transaction.FEE_PER_KB = fees.FEE_PER_KB
    bitcore.Transaction.CHANGE_OUTPUT_MAX_SIZE = fees.CHANGE_OUTPUT_MAX_SIZE
    bitcore.Transaction.MAXIMUM_EXTRA_SIZE = fees.MAXIMUM_EXTRA_SIZE
}

/**
 * Allows the retrieval of information regarding the state of the blockchain
 * (and broadcasting of transactions) from/to a trusted Insight server.
 * @param {string=} url the url of the Insight server
 * @param {Network=} network whether to use livenet or testnet
 * @constructor
 */
function Insight(url, network) {
    if (!url && !network) {
        return new Insight(Networks.defaultNetwork);
    }
    if (Networks.get(url)) {
        var protocol = window.location.protocol || "http:"
        network = Networks.get(url);
        switch (network.name) {
            case "bitcoin":
            case "livenet":
                url = protocol+'//wallet.ribbit.me/api/bitcoin'
                break;
            case "coval":
                url = protocol+"//coval-explorer.mybluemix.net"
                break;
            case "test-ribbit":
                url = protocol+'//test.ribbitchain.info'
                break;
            case "franko":
                url = protocol+'//wallet.ribbit.me/api/franko'
                break;
            case "defcoin":
                url = protocol+'//wallet.ribbit.me/api/defcoin'
                break;
            case "digibyte":
                url = protocol+"//wallet.ribbit.me/api/digibyte"
                break;
            case "litecoin":
                url= protocol+"//wallet.ribbit.me/api/litecoin"
                break;
            case "dash":
                url= protocol+"//wallet.ribbit.me/api/dash"
                break;
            case "ethereum":
                url = protocol+"//wallet.ribbit.me/api/eth"
                break;
            default:
                url = protocol+'//test-insight.bitpay.com'
                break;
        }
    }
    JSUtil.defineImmutable(this, {
        url: url,
        network: Networks.get(network) || Networks.defaultNetwork
    });
    this.request = request;
    return this;
}

/**
 * @callback Insight.GetUnspentUtxosCallback
 * @param {Error} err
 * @param {Array.UnspentOutput} utxos
 */

/**
 * Retrieve a list of unspent outputs associated with an address or set of addresses
 * @param {Address|string|Array.Address|Array.string} addresses
 * @param {GetUnspentUtxosCallback} callback
 */
Insight.prototype.getUnspentUtxos = function (addresses, callback) {
    $.checkArgument(_.isFunction(callback));
    if (!_.isArray(addresses)) {
        addresses = [addresses];
    }
    addresses = _.map(addresses, function (address) {
        return new Address(address);
    });
    
    this.requestPost('/api/addrs/utxo', {
        addrs: _.map(addresses, function (address) {
            return address.toString();
        }).join(',')
    }, function (err, res, unspent) {
        if (err || res.statusCode !== 200) {
            return callback(err || res);
        }
        try {
            unspent = _.map(unspent, UnspentOutput);
        } catch (ex) {
            if (ex instanceof bitcore.errors.InvalidArgument) {
                return callback(ex);
            }
        }
        return callback(null, unspent);
    });
};

/**
 * @callback Insight.BalanceCallback
 * @param {Error} err
 * @param {int} balance
 */

/**
 * Retrieve a balance associated with an address
 * @param {Address|string|Array.Address|Array.string} addresses
 * @param {BalanceCallback} callback
 */

Insight.prototype.getBalance = function (address, callback) {
    $.checkArgument(_.isFunction(callback));
    if (this.network.name !== "ethereum") {
        address = new Address(address)
    }
    
    this.requestGet('/api/addr/' + address.toString() + "/balance", function (err, res, body) {
        if (err || res.statusCode !== 200) {
            return callback(err || body);
        }
        var info;
        try {
            info = body;
        } catch (e) {
            if (e instanceof SyntaxError) {
                return callback(e);
            }
            throw e;
        }
        return callback(null, info);
    });
};

/**
 * @callback Insight.BroadcastCallback
 * @param {Error} err
 * @param {string} txid
 */

/**
 * Broadcast a transaction to the bitcoin network 
 * @param {transaction|string} transaction
 * @param {BroadcastCallback} callback
 */
Insight.prototype.broadcast = function (transaction, callback) {
    $.checkArgument(JSUtil.isHexa(transaction) || transaction instanceof Transaction);
    $.checkArgument(_.isFunction(callback));
    if (transaction instanceof Transaction) {
        transaction = transaction.serialize();
    }
    
    this.requestPost('/api/tx/send', {
        rawtx: transaction
    }, function (err, res, body) {
        if (err || res.statusCode !== 200) {
            return callback(err || body);
        }
        return callback(null, body ? body.txid : null);
    });
};

/**
 * @callback Insight.TransactionCallback
 * @param {Error} err
 * @param {Transaction} info
 */

/**
 * Retrieve information about a transaction
 * @param {TransactionID|string} txid
 * @param {TransactionCallback} callback
 */
Insight.prototype.tx = function (txid, callback) {
    $.checkArgument(_.isFunction(callback));
    
    this.requestGet('/api/tx/' + txid.toString(), function (err, res, body) {
        if (err || res.statusCode !== 200) {
            return callback(err || body);
        }
        var info;
        try {
            info = new Transaction(body);
        } catch (e) {
            if (e instanceof SyntaxError) {
                return callback(e);
            }
            throw e;
        }
        return callback(null, info);
    });
};

/**
 * @callback Insight.AddressCallback
 * @param {Error} err
 * @param {AddressInfo} info
 */

/**
 * Retrieve information about an address
 * @param {Address|string} address
 * @param {AddressCallback} callback
 */
Insight.prototype.address = function (address, callback) {
    $.checkArgument(_.isFunction(callback));
    address = new Address(address);
    
    this.requestGet('/api/addr/' + address.toString(), function (err, res, body) {
        if (err || res.statusCode !== 200) {
            return callback(err || body);
        }
        var info;
        try {
            //info = AddressInfo.fromInsight(body);
            info = body
        } catch (e) {
            if (e instanceof SyntaxError) {
                return callback(e);
            }
            throw e;
        }
        return callback(null, info);
    });
};

/**
 * Internal function to make a post request to the server
 * @param {string} path
 * @param {?} data
 * @param {function} callback
 * @private
 */
Insight.prototype.requestPost = function (path, data, callback) {
    $.checkArgument(_.isString(path));
    $.checkArgument(_.isFunction(callback));
    this.request({
        method: 'POST',
        url: this.url + path,
        json: data
    }, callback);
};

/**
 * Internal function to make a get request with no params to the server
 * @param {string} path
 * @param {function} callback
 * @private
 */
Insight.prototype.requestGet = function (path, callback) {
    $.checkArgument(_.isString(path));
    $.checkArgument(_.isFunction(callback));
    this.request({
        method: 'GET',
        url: this.url + path
    }, callback);
};



module.exports = Insight;






},{"./models/addressinfo":3,"bitcore":"bitcore","request":5}],3:[function(require,module,exports){
'use strict';

var bitcore = require('bitcore');

var _ = bitcore.deps._;
var $ = bitcore.util.preconditions;
var Address = bitcore.Address;
var JSUtil = bitcore.util.js;

function AddressInfo(param) {
  if (!(this instanceof AddressInfo)) {
    return AddressInfo(param);
  }
  if (param instanceof AddressInfo) {
    return param;
  }

  $.checkArgument(param.address instanceof Address);
  $.checkArgument(_.isNumber(param.balance));
  $.checkArgument(_.isNumber(param.totalSent));
  $.checkArgument(_.isNumber(param.totalReceived));
  $.checkArgument(_.isNumber(param.unconfirmedBalance));
  $.checkArgument(_.isArray(param.transactionIds));
  $.checkArgument(_.all(_.map(param.transactionIds, JSUtil.isHexa)));

  JSUtil.defineImmutable(this, param);
}

AddressInfo.fromInsight = function(param) {
  if (_.isString(param)) {
    param = JSON.parse(param);
  }
  return AddressInfo({
    address: new Address(param.addrStr),
    balance: param.balanceSat,
    totalReceived: param.totalReceivedSat,
    totalSent: param.totalSentSat,
    unconfirmedBalance: param.unconfirmedBalanceSat,
    transactionIds: param.transactions
  });
};

module.exports = AddressInfo;

},{"bitcore":"bitcore"}],4:[function(require,module,exports){
module.exports = {
  AddressInfo: require('./addressinfo')
};

},{"./addressinfo":3}],5:[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// UMD HEADER START 
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END

},{}],"bitcore-explorers-multi":[function(require,module,exports){
module.exports = require('./lib');

},{"./lib":1}]},{},[]);
