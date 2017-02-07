/*
exodos - v0.0.0 - 2017-02-07
Transition tools to assist in exodos from legacy chain
Lovingly coded by Shannon Code  - http://cov.al 
*/
function init(){$(document).off("click.customBindings"),footerCallbackCnt=0,table=$("#example-table").DataTable({ajax:"utils/data/rich.json",deferRender:!1,columns:[{className:"details-control",orderable:!0,data:"txs",defaultContent:""},{data:"address"},{data:"balance",className:"sum",render:$.fn.dataTable.render.number(",",".",7,"")},{data:"lastActivity",className:"date",render:$.fn.dataTable.render.moment("YYYY/MM/DD","MMMM D YYYY","en")},{data:"txCount"}],footerCallback:function(row,data,start,end,display){verbose&&console.log("in footerCallback"),getSum(this.api(),function(total){$("tfoot .sum").html(total),0===footerCallbackCnt?footerCallbackCnt++:footerCallbackCnt=0})}}),$.fn.dataTable.ext.search.push(function(settings,data,dataIndex){var min=parseInt($("#min").val(),10),max=parseInt($("#max").val(),10),age=parseFloat(data[4])||0;return isNaN(min)&&isNaN(max)||isNaN(min)&&max>=age||age>=min&&isNaN(max)||age>=min&&max>=age?!0:!1}),loginCheck()}function getSum(table,cb){var cnt=0,total=0,values=table.rows({search:"applied",page:"all"})[0];values.forEach(function(item){var data=table.rows(item).data()[0];return total+=data.balance,cnt==values.length-1?cb(total):void(cnt+=1)})}function loginCheck(cb){if(!cb)var cb=function(bool){};me.data.identity(function(identity){var loggedIn=""!=identity.email&&""!=identity.name;return verbose&&console.log("Logged in",loggedIn,identity),loggedIn?($(".loginStatus").text(identity.name.replace("::"," ")+" Logout"),enableKeysView()):disableKeysView(),cb(loggedIn)})}function enableKeysView(){$("body").off("click.keys"),$("body").on("click.keys",".viewKeys",function(){renderKeysTemplate()})}function disableKeysView(){$("body").off("click.keys"),$("body").on("click.keys",".viewKeys",function(){popLoginModalSelection()})}function showExplorer(){jQuery.get("/explorer",function(resp){templates[name]=Handlebars.compile(resp),display_Pagetemplate(name,".pageContent",function(){init()})})}function showSwap(name,pageObject){jQuery.get("views/layouts/swap.html",function(resp){templates[name]=Handlebars.compile(resp),display_Pagetemplate(name,".pageContent",function(){},pageObject)})}function showSwapResponse(name,pageObject){jQuery.get("views/layouts/swapResponse.html",function(resp){templates[name]=Handlebars.compile(resp),display_Pagetemplate(name,"#swapResponse",function(){},pageObject)})}function display_Pagetemplate(tmpl,selector,cb,data){if($(document).off("click.customBindings"),void 0!==templates[tmpl]){var template=templates[tmpl],html=template(data);return $(selector).html(html),cb()}}function getRow(address,cb){var filtered=table.rows()[0].filter(function(a){var data=table.rows(a).data()[0].address;return data==address});return cb(filtered.length>0?table.rows(filtered[0]).data()[0]:{address:address,balance:0,lastActivity:1469934350,error:"Address not found"})}function signBalance(key,cb){var hd=bitcore.HDPrivateKey(key),address=hd.privateKey.toAddress().toString();getRow(address,function(details){var msg=details.address+details.balance+details.lastActivity+"-test";toProcessed(address);var payload=generatePayload(msg,key);return toSigned(address),payload.coval.swap=details,payload=deserializePayload(payload),cb(payload)})}function deserializePayload(payload){return"string"==typeof payload&&(payload=JSON.parse(payload)),payload.verify=getVerifyFunction(payload),payload.serialize=function(){return JSON.stringify(payload)},payload}function getVerifyFunction(payload){var cb=function(result){return result};return function(){return newtables.privkey.verifyMessage(payload.coval.toSign,payload.coval.covalAddress,payload.coval.signature,cb)}}function generateNewMnemonicSeed(){var m=new _Mnemonic(128),p=m.toWords().toString().replace(/,/gi," "),h=m.toHex(),encrypted=CryptoJS.AES.encrypt(h,String(0)).toString();return localStorage.setItem("fakeWallet",!0),localStorage.setItem("wallet",encrypted),{phrase:p,seed:h}}function generateSeedFromFreeWallet(){return null===localStorage.getItem("wallet")?generateNewMnemonicSeed().seed:CryptoJS.AES.decrypt(localStorage.getItem("wallet"),String(0)).toString(CryptoJS.enc.Utf8)}function generateMnemonicFromFreeWallet(){var m=new _Mnemonic.fromHex(generateSeedFromFreeWallet());return m.toWords()}function generateAddressFromSeed(seed,index,cb){var pk=bitcore.HDPrivateKey.fromSeed(seed,bitcore.Networks.mainnet),d=pk.derive("m/0'/0/"+index),returnVal=d.privateKey.toAddress().toString();return cb(returnVal)}function checkIfCanSignKeys(){}function newPerformSignatures(){var _keys;me.data.privkey.allRecordsArray(function(items){function finalize(swapResponse){console.log("complete collecting signatures",swapResponse);var payload={payload:swapResponse},mnemonicBackup=payload.payload.mnemonic;payload.payload.mnemonic="***MASKED***",checkPayloadWithServer(payload,function(serverResults){swapResponse.mnemonic=mnemonicBackup,swapResponse.serverResults=serverResults;var safe=JSON.stringify(swapResponse);swapResponse.safe=safe,showSwapResponse("response",swapResponse),$(".responseContents").html(swapResponse)}),cleanupFakeWallet()}_keys=items.filter(function(item){return"coval"===item.key.network.name});var requestCollector={totalBalance:0,payloads:[]};performSignature(_keys,0,requestCollector,finalize)})}function checkPayloadWithServer(payload,cb){$.ajax({url:"https://coval-exodos-verify.mybluemix.net/v1/verify",type:"POST",data:JSON.stringify(payload),contentType:"application/json; charset=utf-8",dataType:"json",success:function(result){return console.log("result",result),cb(result)},error:function(result){return console.log("result",result),cb(result)}})}function cleanupFakeWallet(){null!==localStorage.getItem("fakeWallet")&&(localStorage.removeItem("fakeWallet"),localStorage.removeItem("wallet"))}function performSignature(_keys,index,requestCollector,finalize){function next(){index!==_keys.length-1?(index+=1,unBlockUi(function(){performSignature(_keys,index,requestCollector,finalize)})):generateAddressFromSeed(generateSeedFromFreeWallet(),freeWalletAddressIndex,function(xcpAddress){return finalSwap=packageSwapResponse(xcpAddress,requestCollector),finalize(finalSwap)})}var _key=_keys[index];toProcessing(getAddressFromKeyMetadata(_key.key.xprivkey)),unBlockUi(function(){signBalance(_key.key.xprivkey,function(_payload){var roundedBalance=Math.round(_payload.coval.swap.balance);requestCollector.totalBalance+=roundedBalance,requestCollector.payloads.push(_payload);var msg="Processed <b>"+_payload.coval.covalAddress+"</b> <br>With a balance of "+_payload.coval.swap.balance+" <br>Rounded to "+roundedBalance+"<br> For a total of "+requestCollector.totalBalance;$(".manage.row:contains('"+_payload.coval.covalAddress+"')").append("<div class='manage row'><div class='col-xs-12 span12'>"+msg+"</div></div>"),console.log("Processed",_payload.coval.covalAddress,"with a balance of",_payload.coval.swap.balance,"rounded to",roundedBalance,"for a total of",requestCollector.totalBalance),next()})})}function getAddressFromKeyMetadata(key){return $("[keydata='"+key+"']").parent().find(".key-address").text().trim()}function unBlockUi(func){return setTimeout(func,10)}function packageSwapResponse(xcpAddress,requestCollector){var bonusAmount=Math.round(requestCollector.totalBalance*bonusPercentage);return{CounterpartyAddress:xcpAddress,SwapSignatures:requestCollector.payloads,A_TotalOfBalances:requestCollector.totalBalance,B_BonusAmount:bonusAmount,C_TotalSwapRequested:requestCollector.totalBalance+bonusAmount,PassedSignatureChecks:!0,mnemonic:generateMnemonicFromFreeWallet().join(" ")}}function toProcessed(address){var element=$(".manage.row:contains("+address+") .processed-label");element.removeClass("label-warning"),element.addClass("label-primary"),element.text("Processed")}function toProcessing(address){var element=$(".manage.row:contains("+address+") .processed-label");element.addClass("label-warning"),element.text("Processing")}function toSigned(address){var element=$(".manage.row:contains("+address+") .signed-label");element.addClass("label-success"),element.text("Signed")}var finalSwap,table;$(document).ready(function(){init(),verbose=!1;Mnemonic}),$("#min, #max").keyup(function(){table.draw()}),$("body").on("keyup",".customSearch",function(){$("input[type='search']").val($(".customSearch").val()),$("input[type='search']").trigger("keyup")}),$(".dataTables_filter").hide(),$(function(){$("#nav li a").click(function(){$("#nav li").removeClass(),$($(this).attr("href")).addClass("active")})}),$("body").on("click",".loginStatus",function(){popLoginModalSelection()}),$("body").on("click",".startSwap",function(){newPerformSignatures()}),$("body").on("click","#example-table tbody",function(){var tr=$(this).closest("tr"),row=table.row(tr);row.child.isShown()?(row.child.hide(),tr.removeClass("shown")):(row.child(format(row.data())).show(),tr.addClass("shown"))});var templates={},_rows;$("body").on("click",".showSwap",function(){getChainIdsFromAvailableNetworks(function(chainIds){getMyKeys(function(rows){_rows=rows,rows=rows.rows.filter(function(row){return"coval"===row.network});var pageObject={};pageObject.chainIds=chainIds,pageObject.rows=rows,showSwap("swap",pageObject)})})});const bonusPercentage=.15,freeWalletAddressIndex=0;