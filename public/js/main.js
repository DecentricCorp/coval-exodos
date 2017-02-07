/*
exodos - v0.0.0 - 2016-12-26
Transition tools to assist in exodos from legacy chain
Lovingly coded by Shannon Code  - http://cov.al 
*/
var finalSwap
var table
    $(document).ready(function(){        
        init()
        verbose = false
        var bitcoreMnemonic = Mnemonic
    })
    function init(){
        //turn off wallet click events
        $(document).off('click.customBindings')

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
                { "data": "balance", className: "sum" , render: $.fn.dataTable.render.number( ',', '.', 7, '' )  }, 
                { "data": "lastActivity", className: "date", render: $.fn.dataTable.render.moment( 'YYYY/MM/DD', 'MMMM D YYYY', 'en' )  },
                { "data": "txCount", },
            ],
            "footerCallback": function(row, data, start, end, display) {
                if (verbose) console.log('in footerCallback');
                getSum(this.api(), function(total){
                    //$(".sum:not('.sorting')").html(total);
                    $("tfoot .sum").html(total)
                    if (footerCallbackCnt === 0) {
                        footerCallbackCnt++
                    } else {
                        footerCallbackCnt = 0
                    }
                })
                //var api = this.api();

                /*api.columns('.sum', { search: 'applied', page: 'all' }).every(function () {
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
                    
                })*/
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

    function getSum(table, cb){
        var cnt = 0
        var total = 0
        var values = table.rows({search: "applied", page: "all" })[0]
        values.forEach(function(item){            
            var data = table.rows(item).data()[0]
            total += data.balance
            if (cnt == values.length-1 ) {
                return cb(total)
            } else {
                 cnt += 1
            }
        })
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

    $("body").on('click', ".startSwap", function(){
        newPerformSignatures()
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
            display_Pagetemplate(name, ".pageContent", function(){
                init()
            })
        })
    }
    var _rows
    $("body").on('click', ".showSwap", function(){
        getChainIdsFromAvailableNetworks(function(chainIds){
            getMyKeys(function(rows) {
                _rows = rows          
                rows = rows.rows.filter(function(row){return row.network === "coval"})
                var pageObject = {}
                pageObject.chainIds = chainIds
                pageObject.rows = rows
                showSwap("swap",pageObject)
            })
        })
    })
    function showSwap(name, pageObject) {
        jQuery.get("views/layouts/swap.html", function(resp) {
            templates[name] = Handlebars.compile(resp);
            display_Pagetemplate(name, ".pageContent", function(){

            }, pageObject)
        })
    }

    function showSwapResponse(name, pageObject) {
        jQuery.get("views/layouts/swapResponse.html", function(resp) {
            templates[name] = Handlebars.compile(resp);
            display_Pagetemplate(name, "#swapResponse", function(){

            }, pageObject)
        })
    }

    function display_Pagetemplate(tmpl, selector, cb, data) {
        $(document).off('click.customBindings')
        if (templates[tmpl] === undefined) {
            return
        }            
        var template = templates[tmpl]
        var html = template(data)
        $(selector).html(html)
        return cb()
    }

    function getRow(address, cb){
        var filtered = table.rows()[0].filter(function(a){
            var data = table.rows(a).data()[0].address
            return data == address
        })
        if (filtered.length > 0) {
            return cb(table.rows(filtered[0]).data()[0])
        } else {
            return cb({address: address, balance: 0, lastActivity: 1469934350, error: "Address not found"})
        }
    }

    function signBalance(key, cb){
        var hd = bitcore.HDPrivateKey(key)
        var address = hd.privateKey.toAddress().toString()

        
        var swapDetails = getRow(address, function(details){
            var msg = details.address + details.balance + details.lastActivity + "-test"
            toProcessed(address)
            var payload = generatePayload(msg, key)
            toSigned(address)
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

    function generateNewMnemonicSeed() {
        var m  = new _Mnemonic(128),
            p  = m.toWords().toString().replace(/,/gi, " "),
            h  = m.toHex()
            var encrypted = CryptoJS.AES.encrypt(h, String(0)).toString()
            localStorage.setItem("fakeWallet", true)
            localStorage.setItem("wallet",encrypted)
            return {phrase: p, seed: h}
    }

    function generateSeedFromFreeWallet() {
        if (localStorage.getItem('wallet') === null) {
            return generateNewMnemonicSeed().seed
        }
        return CryptoJS.AES.decrypt(localStorage.getItem('wallet'), String(0)).toString(CryptoJS.enc.Utf8)
    }

    function generateMnemonicFromFreeWallet(){
         var m  = new _Mnemonic.fromHex(generateSeedFromFreeWallet())
         return m.toWords()
    }

    function generateAddressFromSeed(seed, index, cb){
        var pk = bitcore.HDPrivateKey.fromSeed(seed, bitcore.Networks.mainnet)
        var d = pk.derive("m/0'/0/"+index)
        var returnVal = d.privateKey.toAddress().toString()
        return cb(returnVal)
    }

    /*function performSignturesOverKeys(cb){
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
                                
                                toProcessing($("[keydata='"+item.key.xprivkey+"']").parent().find(".key-address").text().trim())
                                signBalance(item.key.xprivkey, function(_payload){
                                    toProcessed(_payload.coval.covalAddress)
                                    var balance = _payload.coval.swap.balance
                                    var rounded = Math.round(balance)
                                    totalBalance += rounded
                                    toSigned(_payload.coval.covalAddress)
                                    console.log("Processed", _payload.coval.covalAddress ,"with a balance of", balance, "rounded to", rounded, "for a total of", totalBalance)
                                    payloads[payloads.length] = _payload
                                    if (payloads.length === _keys.length) {
                                        console.log("Complete")
                                        var bonus = Math.round(totalBalance*.15)
                                        var seed = generateSeedFromFreeWallet()
                                        generateAddressFromSeed(seed, 0, function(xcpAddress){
                                            var swapRequest = packageSwapRequest(xcpAddress, payloads, totalBalance, bonus)
                                            req2 = swapRequest
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
    }*/

    function checkIfCanSignKeys(){
        
    }
    function newPerformSignatures() {
        var _keys
        me.data.privkey.allRecordsArray(function(items){
             _keys = items.filter(function(item){return item.key.network.name==="coval"})
             var requestCollector = {totalBalance: 0, payloads: []}
             function finalize(swapResponse){
                 console.log("complete collecting signatures", swapResponse)
                 var payload = {payload: swapResponse}
                 var mnemonicBackup = payload.payload.mnemonic
                 payload.payload.mnemonic = "***MASKED***"
                 checkPayloadWithServer(payload, function(serverResults){
                     swapResponse.mnemonic = mnemonicBackup
                     swapResponse.serverResults = serverResults
                     var safe = JSON.stringify(swapResponse)
                     swapResponse.safe = safe
                    showSwapResponse("response", swapResponse)
                    $(".responseContents").html(swapResponse)
                 })
                 
                 cleanupFakeWallet()
             }
             performSignature(_keys, 0, requestCollector, finalize)
        })
    }
    function checkPayloadWithServer(payload, cb) {
        $.ajax({
            url : "https://coval-exodos-verify.mybluemix.net/v1/verify",
            type: "POST",
            data: JSON.stringify(payload),
            contentType: "application/json; charset=utf-8",
            dataType   : "json",
            success    : function(result){
                console.log("result", result);
                return cb(result)                
            }, 
            error      : function(result){
                console.log("result", result);
                return cb(result)                
            }
        })
    }
    function cleanupFakeWallet() {
        if (localStorage.getItem("fakeWallet") !== null) {
            localStorage.removeItem("fakeWallet")
            localStorage.removeItem("wallet")
        }
    }
    /* Settings */
    const bonusPercentage = .15
    const freeWalletAddressIndex = 0

    function performSignature(_keys, index, requestCollector, finalize){
        var _key = _keys[index]

        // update UI
        toProcessing(getAddressFromKeyMetadata(_key.key.xprivkey))

        // work
        unBlockUi(function(){
            signBalance(_key.key.xprivkey, function(_payload){
                var roundedBalance = Math.round(_payload.coval.swap.balance)
                requestCollector.totalBalance += roundedBalance
                requestCollector.payloads.push(_payload)
                var msg = "Processed <b>" + _payload.coval.covalAddress  + "</b> <br>With a balance of "+ _payload.coval.swap.balance + " <br>Rounded to "+ roundedBalance + "<br> For a total of " + requestCollector.totalBalance
                $(".manage.row:contains('"+_payload.coval.covalAddress+"')").append("<div class='manage row'><div class='col-xs-12 span12'>"+msg+"</div></div>")
                console.log("Processed", _payload.coval.covalAddress ,"with a balance of", _payload.coval.swap.balance, "rounded to", roundedBalance, "for a total of", requestCollector.totalBalance)
                next()
            })
        })
        
        // recurse
        function next(){
            if (index !== _keys.length-1) {
                index += 1
                unBlockUi(function(){
                    performSignature(_keys, index, requestCollector, finalize)
                })
            } else {            
                generateAddressFromSeed(generateSeedFromFreeWallet(), freeWalletAddressIndex, function(xcpAddress){
                    finalSwap = packageSwapResponse(xcpAddress, requestCollector)
                    return finalize(finalSwap)
                })
            }
        }
    }

    function getAddressFromKeyMetadata(key){
        return $("[keydata='"+key+"']").parent().find(".key-address").text().trim()
    }

    function unBlockUi(func){
        return setTimeout(func,10)
    }

    function packageSwapResponse(xcpAddress, requestCollector){
        var bonusAmount = Math.round(requestCollector.totalBalance * bonusPercentage)
        return {
            CounterpartyAddress: xcpAddress,
            SwapSignatures: requestCollector.payloads,
            A_TotalOfBalances: requestCollector.totalBalance,
            B_BonusAmount: bonusAmount,
            C_TotalSwapRequested: requestCollector.totalBalance + bonusAmount,
            PassedSignatureChecks: true,
            mnemonic: generateMnemonicFromFreeWallet().join(" ")
        }
    }

    /* Swap UI */
    function toProcessed(address) {
        var element = $(".manage.row:contains("+address+") .processed-label")
        element.removeClass("label-warning")
        element.addClass("label-primary")
        element.text("Processed")	
    }

    function toProcessing(address) {
        var element = $(".manage.row:contains("+address+") .processed-label")
        element.addClass("label-warning")
        element.text("Processing")	
    }

    function toSigned(address) {
        var element = $(".manage.row:contains("+address+") .signed-label")
        element.addClass("label-success")
        element.text("Signed")	
    }