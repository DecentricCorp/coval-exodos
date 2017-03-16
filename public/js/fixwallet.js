

var uploadButton = $('#upload');

$(document).on("click", "#upload", function(){
    console.log("click")
    var fileInput = $('#files');
    if (!window.FileReader) {
        alert('Your browser is not supported')
    }
    var input = fileInput.get(0);
    
    // Create a reader object
    var reader = new FileReader();
    if (input.files.length) {
        var textFile = input.files[0];
        reader.readAsText(textFile);
        $(reader).on('load', processFile);
    } else {
        alert('Please upload a file before continuing')
    } 
})

function processFile(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
        repair(file)
    }
}

function repair(encrypted) {
    var password = $("#password").val()
    var decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8)
        decrypted = JSON.parse(decrypted)
    Object.keys(decrypted.privkey)
        .filter(function(item){
            if( decrypted.privkey[item].key.network.name === "ribbit") {
                decrypted.privkey[item].key.network.name = "coval"; 
                decrypted.privkey[item].key.network.alias = "coval";
            }
        })
    Object.keys(decrypted.privkey)
        .filter(function(item){
            if( decrypted.privkey[item].key.network.name === "synrg") {
                decrypted.privkey[item].key.network.name = "coval"; 
                decrypted.privkey[item].key.network.alias = "coval";
            }
        })
    Object.keys(decrypted.privkey)
        .filter(function(item){
            if( decrypted.privkey[item].key.network.name === "nrg") {
                decrypted.privkey[item].key.network.name = "coval"; 
                decrypted.privkey[item].key.network.alias = "coval";
            }
        })
    var reEncrypted = CryptoJS.AES.encrypt(JSON.stringify(decrypted),password).toString()
    download(reEncrypted, 'repairedWalletBackup.txt', 'text/plain');
}

function decrypt(){}

function download(text, name, type) {
        var a = document.createElement("a");
        var file = new Blob([text], {type: type});
        a.href = URL.createObjectURL(file);
        a.download = name;
        a.click();
    }