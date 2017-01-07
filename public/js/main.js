/*
exodos - v0.0.0 - 2016-12-26
Transition tools to assist in exodos from legacy chain
Lovingly coded by Shannon Code  - http://cov.al 
*/

var table
    $(document).ready(function(){        
        init()
        verbose = false
        var bitcoreMnemonic = Mnemonic
    })
    function init(){
        footerCallbackCnt = 0
        table = 
        $('#example-table').DataTable({
            "ajax": "utils/data/rich.json",
            "deferRender": false,
            "columns": [
                {
                    "className": 'details-control',
                    "orderable": true,
                    "data": "txs",
                    "defaultContent": ''
                },
                { "data": "address"  },
                { "data": "balance", className: "sum" ,render: $.fn.dataTable.render.number( ',', '.', 7, '' )  }, 
                { "data": "lastActivity"  },
                { "data": "txCount", },
            ],
            "footerCallback": function(row, data, start, end, display) {
                if (verbose) console.log('in footerCallback');
                var api = this.api();

                api.columns('.sum', { search: 'applied', page: 'all' }).every(function () {
                    var sum = api
                        .cells( null, this.index(), { search: 'applied', page: 'all'} )
                        .render('display')
                        .reduce(function (a, b) {
                            //b = b.split(">")[1]
                            //b = b.replace(',','').replace(',','')
                            //console.log( a,b)
                            var x = parseFloat(a) || 0;
                            var y = parseFloat(b) || 0;
                            return x + y;
                        }, 0);
                    if (verbose) console.log(this.index() +' '+ sum); //alert(sum);
                    $(this.footer()).html(sum);
                    if (footerCallbackCnt === 0) {
                        footerCallbackCnt++
                    } else {
                        footerCallbackCnt = 0
                        //popLoginModalSelection()
                    }
                    
                })
            }
        })
        $.fn.dataTable.ext.search.push(
            function( settings, data, dataIndex ) {
                var min = parseInt( $('#min').val(), 10 );
                var max = parseInt( $('#max').val(), 10 );
                var age = parseFloat( data[4] ) || 0; // use data for the age column
        
                if ( ( isNaN( min ) && isNaN( max ) ) ||
                    ( isNaN( min ) && age <= max ) ||
                    ( min <= age   && isNaN( max ) ) ||
                    ( min <= age   && age <= max ) )
                {
                    return true;
                }
                return false;
            }
        )
        loginCheck()
    }

    function loginCheck(cb) {
        if (!cb) {
            var cb = function(bool){}
        }
        me.data.identity(function(identity){
            var loggedIn = (identity.email != "" && identity.name != "")
            if (verbose) console.log("Logged in", loggedIn, identity)
            if (loggedIn) {
                $(".loginStatus").text(identity.name.replace('::', ' ') + " Logout"  )
                enableKeysView()                
            } else {
                disableKeysView()
            }
            return cb(loggedIn)
        })
    }
            
    $('#min, #max').keyup( function() {
        table.draw();
    })
    $('body').on('keyup', '.customSearch', function() {
        $("input[type='search']").val($(".customSearch").val())
        $("input[type='search']").trigger("keyup")
    })
    $(".dataTables_filter").hide()
    $(function() {
        $('#nav li a').click(function() {
            $('#nav li').removeClass()
            $($(this).attr('href')).addClass('active')
        })
    })
    $("body").on('click', ".loginStatus", function(){
        popLoginModalSelection()
    })
    
    function enableKeysView(){
        $("body").off('click.keys')
        $("body").on('click.keys', ".viewKeys", function(){
             renderKeysTemplate()
        })
    }

    function disableKeysView() {
        $("body").off('click.keys')
        $("body").on('click.keys', ".viewKeys", function(){
             popLoginModalSelection()
        })
    }

    /*$("body").on('click', '.showExplorer', function(){
        showExplorer()
    })*/

    $("body").on('click', "#example-table tbody", function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );

        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            tr.addClass('shown');
        }
    })       

    var templates = {}
    function showExplorer() {
        jQuery.get("/explorer", function(resp) {
            templates[name] = Handlebars.compile(resp);
            display_Pagetemplate(name, function(){
                init()
            })
        })
    }

    function display_Pagetemplate(tmpl, cb) {
        console.log('display')
        if (templates[tmpl] === undefined) {
            return
        }            
        var template = templates[tmpl]
        var html = template()
        $(".pageContent").html(html)
        return cb()
    }

    function getRow(address, cb){
        var filtered = table.rows()[0].filter(function(a){
                        var data = table.rows(a).data()[0].address
                        return data == address
                    })
        return cb(table.rows(filtered[0]).data()[0])
    }

    function signBalance(key, cb){
        var hd = bitcore.HDPrivateKey(key)
        var address = hd.privateKey.toAddress().toString()
        
        var swapDetails = getRow(address, function(details){
            var msg = details.address + details.balance + details.lastActivity
            var payload = generatePayload(msg, key)
            payload.coval.swap = details
            payload = deserializePayload(payload)
            return cb(payload)
        })
    }

    function deserializePayload(payload) {
        if (typeof(payload) === "string") {
            payload = JSON.parse(payload)
        }
        payload.verify = getVerifyFunction(payload)
        payload.serialize = function(){return JSON.stringify(payload)}
        return payload
    }

    function getVerifyFunction(payload){
        var cb = function(result){
                    return result
                }
        return function() {
            return newtables.privkey.verifyMessage(payload.coval.toSign, payload.coval.covalAddress, payload.coval.signature, cb)
        }
    }

    function generateMnemonicSeed() {
        var m  = new _Mnemonic(128),
            p  = m.toWords().toString().replace(/,/gi, " "),
            h  = m.toHex()
            return {phrase: p, seed: h}
    }

    function generateSeedFromFreeWallet() {
        return CryptoJS.AES.decrypt(localStorage.getItem('wallet'), String(0)).toString(CryptoJS.enc.Utf8)
    }

    function generateAddressFromSeed(seed, index, cb){
        var pk = bitcore.HDPrivateKey.fromSeed(seed, bitcore.Networks.mainnet)
        var d = pk.derive("m/0'/0/"+index)
        var returnVal = d.privateKey.toAddress().toString()
        return cb(returnVal)
    }

    function performSignturesOverKeys(cb){
        var payloads = []
        var totalBalance = 0
        var _keys
        if (!cb) {var cb = function(){}}
        loginCheck(function(loggedIn){
            if (loggedIn) {
                if (localStorage.address) {
                    me.data.privkey.allRecordsArray(function(items){
                        if (items.length > 0) {
                            _keys = items.filter(function(item){return item.key.network.name==="coval"})                        
                            _keys.forEach(function(item){
                                //console.log(item.key.xprivkey)
                                signBalance(item.key.xprivkey, function(_payload){
                                    var balance = _payload.coval.swap.balance
                                    var rounded = Math.round(balance)
                                    totalBalance += rounded
                                    console.log("Processed", _payload.coval.covalAddress ,"with a balance of", balance, "rounded to", rounded, "for a total of", totalBalance)
                                    payloads[payloads.length] = _payload
                                    if (payloads.length === _keys.length) {
                                        console.log("Complete")
                                        var bonus = Math.round(totalBalance*.15)
                                        var seed = generateSeedFromFreeWallet()
                                        generateAddressFromSeed(seed, 0, function(xcpAddress){
                                            var swapRequest = packageSwapRequest(xcpAddress, payloads, totalBalance, bonus)
                                            return cb(swapRequest)
                                        })
                                        
                                    }
                                })
                            })
                        } else {
                            return cb(payloads)
                        }
                    })
                } else {
                    console.log("No xcp address")
                }
            } else {
                console.log("Not logged in")
                popLoginModalSelection()
            }
            return cb(payloads) 
        })        
    }

    function packageSwapRequest(xcpAddress, payloads, totalBalance, bonus){
        return {
                    CounterpartyAddress: xcpAddress,
                    SwapSignatures: payloads,
                    A_TotalOfBalances: totalBalance,
                    B_BonusAmount: bonus,
                    C_TotalSwapRequested: totalBalance + bonus,
                    PassedSignatureChecks: true
                }
    }