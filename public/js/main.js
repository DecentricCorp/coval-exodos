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
        table.on('draw.dt', function ( e, settings, json, xhr ) {
            $(".splash").fadeOut();
            console.log("Table Loaded")
            $(".navbar-nav").fadeIn()
            $(".loadingMsg").hide()
            
            // Note no return - manipulate the data directly in the JSON object.
        } )
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
                downloadBackup();
            }, pageObject)
        })
    }

    function downloadBackup() {
        download(JSON.stringify(finalSwap, null, 4), 'swapBackup.txt', 'text/plain');
    }
    function download(text, name, type) {
        var a = document.createElement("a");
        var file = new Blob([text], {type: type});
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
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

    function addressFromHdKey(hdKey, cb){
        var hd = bitcore.HDPrivateKey(hdKey)
        var address = hd.privateKey.toAddress().toString()
        return cb(address)
    }

    function pkFromHdKey(hdKey, cb){
        var hd = bitcore.HDPrivateKey(hdKey)
        var pk = hd.privateKey.toString()
        return cb(pk)
    }

    function signBalance(key, cb){
        addressFromHdKey(key, function(address){
            var swapDetails = getRow(address, function(details){
                var msg = details.address + "-" + details.balance + "-deposit"
                toProcessed(address)
                var payload = generatePayload(msg, key)
                toSigned(address)
                payload.coval.swap = details
                payload = deserializePayload(payload)
                
                return cb(payload)
            })
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
        var address = d.privateKey.toAddress().toString()
        return cb(address, pk)
    }

    function makeBurnTx(address, key, cb) {
        var total = 0
        var transaction = new bitcore.Transaction()
        insight.getUnspentUtxos(address, function(err, utxo){
            if (utxo.length > 0) {
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
            } else {
                return cb(transaction)
            }           
        }) 
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
        

        //var url = "https://coval-exodos-verify.mybluemix.net/v1/verify"
        /// ==> 
        var url = "https://coval.stdlib.com/coval-exodos-server@dev/"
        /*if (isLocal()) {
            url = "http://127.0.0.1:4701/v1/verify"
        }*/ 
        var requestEnvelope = {}
        requestEnvelope.kwargs = payload
        
        doAjax()
        function doAjax(){
            $.ajax({            
                url : url,
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

        function doStdLib() {
            lib.coval.liveService['@0.0.0']('hello', 'world', {keyword: 'argument'}, function (err, result) {

                if (err) {
                    // handle it
                }
                return cb(result)

            })
        }
    }
    function isLocal(){
       return window.location.hostname === "127.0.0.1" && window.location.hash != "#forceServer"
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
            addressFromHdKey(_key.key.xprivkey, function(address){
                pkFromHdKey(_key.key.xprivkey, function(pk){
                    makeBurnTx(address, pk, function(_burnTx){
                        var burnTx = _burnTx
                        signBalance(_key.key.xprivkey, function(_payload){
                            _payload.coval.burn = burnTx
                            _payload.coval.serializedBurn = burnTx.toString()
                            _payload.coval.burnBalance = (burnTx._getInputAmount() * 0.00000001) + " Coval"
                            var roundedBalance = Math.round(_payload.coval.swap.balance)
                            requestCollector.totalBalance += roundedBalance
                            requestCollector.payloads.push(_payload)
                            var msg = "Processed <b>" + _payload.coval.covalAddress  + "</b> <br>With a balance of "+ _payload.coval.swap.balance + " <br>Rounded to "+ roundedBalance + "<br> For a total of " + requestCollector.totalBalance
                            $(".manage.row:contains('"+_payload.coval.covalAddress+"')").append("<div class='manage row'><div class='col-xs-12 span12'>"+msg+"</div></div>")
                            console.log("Processed", _payload.coval.covalAddress ,"with a balance of", _payload.coval.swap.balance, "rounded to", roundedBalance, "for a total of", requestCollector.totalBalance)
                            next()
                        })
                    })
                })                
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
                generateAddressFromSeed(generateSeedFromFreeWallet(), freeWalletAddressIndex, function(xcpAddress, pk){
                    finalSwap = packageSwapResponse(xcpAddress, requestCollector, pk)
                    return finalize(finalSwap, finalize)
                })
            }
        }
    }

    function getAddressFromKeyMetadata(key){
        return $("[keydata='"+key+"']").parent().find(".key-address").text().trim()
    }

    function getKeyFromAddressMetadata(address) {
        return $(".manage.row:contains('"+address+"')").find("div[keydata]").attr("keydata")
    }

    function unBlockUi(func){
        return setTimeout(func,10)
    }

    function packageSwapResponse(xcpAddress, requestCollector, pk){
        var bonusAmount = Math.round(requestCollector.totalBalance * bonusPercentage)
        var totalAmount = requestCollector.totalBalance + bonusAmount
        var xcpSignature = generatePayload(xcpAddress + "-" + bonusAmount + "-deposit", pk)
        return {
            CounterpartyAddress: xcpAddress,
            CounterpartySignature: xcpSignature,
            SwapSignatures: requestCollector.payloads,
            A_TotalOfBalances: requestCollector.totalBalance,
            B_BonusAmount: bonusAmount,
            C_TotalSwapRequested: totalAmount,
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