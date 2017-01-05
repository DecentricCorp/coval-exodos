/*
 *    Welcome to the Kloudless JS File Explorer!
 *
 *    To view the explorer in action click 'Result'!
 */
var explorer
var blobData = ""
var fileUploadedFlag = false;
var fileName = "Ribbit.me-Full-Account-Backup.txt"
function initKloud() {
    explorer = window.Kloudless.explorer({
        app_id: 'bZHisu_8861zNPS5TdfCc3j3ddy3pjJENtghT0BFaMH_9yE1',
        multiselect: true,
        computer: true,
        link: true,
        direct_link : true,
        overwrite: false,
        services: ['all'],
        types: ['text'],
        display_backdrop: true
    });

    explorer.on('success', function (files) {
        $(".splash").fadeIn()
        if (!fileUploadedFlag) {
            if (verbose) console.log("This is an import", files)
            if (files.length < 1) {
                return popMsg("Filename should be unique")
            }
            getFileContents(files[0].account, files[0].id, function(contents) {
                if (verbose)console.log(contents)
                importEncrypted(contents)
            })
            return
        }
        console.log('Successfully selected files: ', files)
        var fileContainer = document.getElementById('file-info')

        // remove all elements
        while (fileContainer.lastChild) {
            fileContainer.removeChild(fileContainer.lastChild);
        }

        var fileJSON = document.createElement('pre');
        fileJSON.appendChild(document.createTextNode(
            JSON.stringify(files, null, 2)));

        fileContainer.appendChild(fileJSON);
        console.log(files)
        updateContents(files[0].account, files[0].id, function() {
            fileUploadedFlag = false;
        })
    });
    
    

    explorer.on('cancel', function() {
        console.log('File selection cancelled.');

        var fileContainer = document.getElementById('file-info');

        // remove all elements
        while (fileContainer.lastChild) {
            fileContainer.removeChild(fileContainer.lastChild);
        }

        var result = document.createElement('p');
        result.appendChild(document.createTextNode('File selection cancelled!'));
        fileContainer.appendChild(result);
    });
    explorer.on('error', function(error) {
        console.log('An error occurred: ', error);

        var fileContainer = document.getElementById('file-info');

        // remove all elements
        while (fileContainer.lastChild) {
            fileContainer.removeChild(fileContainer.lastChild);
        }

        var result = document.createElement('p');
        result.appendChild(document.createTextNode('An error occurred in file selection!'));
        fileContainer.appendChild(result);
    });

    explorer.on('addAccount', function(account) {
        console.log('Succesfully added account: ', account);

        var fileContainer = document.getElementById('file-info');

        // remove all elements
        while (fileContainer.lastChild) {
            fileContainer.removeChild(fileContainer.lastChild);
        }

        var result = document.createElement('p');
        result.appendChild(document.createTextNode('Account added: ' +
            JSON.stringify(account)));
        fileContainer.appendChild(result);
    });

    explorer.on('deleteAccount', function(account) {
        console.log('Succesfully deleted account: ', account);

        var fileContainer = document.getElementById('file-info');

        // remove all elements
        while (fileContainer.lastChild) {
            fileContainer.removeChild(fileContainer.lastChild);
        }

        var result = document.createElement('p');
        result.appendChild(document.createTextNode('Deleted account: ' +
            JSON.stringify(account)));
        fileContainer.appendChild(result);
    });

    explorer.on('startFileUpload', function(file) {
        console.log('started file upload file: ', file);
    });

    explorer.on('finishFileUpload', function(file) {
        console.log('finished file upload file: ', file);
        fileUploadedFlag = true
    });
}


function updateContents(account, id, cb) {
    $.ajax({
        url: 'http://api.kloudless.com/v0/accounts/'+ account+'/files/'+id,
        type: 'PUT',
        data: blobData,
        headers: { 'Authorization': 'ApiKey OKbrCHOC7GeD0UAgr2e_9vG1AePohyOJWpY_LeBpJvHfZTyJ' }
    }).done(function (data) {
        if (verbose) console.log("data", data.objects)
        return cb(data.objects)
    })
}

function getKloudlessHistory(account, cb) {
    $.ajax({
        url: "https://api.kloudless.com:443/v0/accounts/"+ account +"/recent/",
        headers: { 'Authorization': 'ApiKey OKbrCHOC7GeD0UAgr2e_9vG1AePohyOJWpY_LeBpJvHfZTyJ' }
    } ).done(function (data) {
        if (verbose) console.log("data", data.objects)
        return cb(data)
    })
}

function getFileContents(account, id, cb) {
    $.ajax({
        url: "https://api.kloudless.com:443/v0/accounts/" + account + "/files/"+id+"/contents/",
        headers: { 'Authorization': 'ApiKey OKbrCHOC7GeD0UAgr2e_9vG1AePohyOJWpY_LeBpJvHfZTyJ' }
    }).done(function (data) {
        if (verbose) console.log("data", data.objects)
        return cb(data)
    })
}

/*saveFile(77726951,"shannon@ribbit.me","updated-callback",function(data){popMsg("Saved Cloud Backup") }, function() {popMsg("Error saving Cloud Backup")})*/
function saveFile(account, email, data, success, fail) {
    var fileName = "Ribbit.me-Full-Account-Backup.txt"
    var formData = new FormData();
    var blob = new Blob([data], { type: 'plain/text' });
    formData.append('file', blob, "backup");
    formData.append('metadata', JSON.stringify({ "parent_id": "root", "name": email + "-" + fileName }))


    $.ajax({
        url: "https://api.kloudless.com:443/v0/accounts/" + account + "/files/?overwrite=true",
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: { 'Authorization': 'ApiKey OKbrCHOC7GeD0UAgr2e_9vG1AePohyOJWpY_LeBpJvHfZTyJ' },
        success: function(data, textStatus, XMLHttpRequest) {
            if (verbose) {
                console.log('Error: ' + textStatus)
            }
            return success(data)
        },
        error: function(xhr, ajaxOptions, thrownError) {
            if (verbose) {
                console.error(xhr.status)
                console.error(xhr.statusText)
                console.error(xhr.responseText)
            }
            return fail(xhr)
        }
    })
}

function search(account, keyword, cb) {
    $.ajax({
        url: "http://api.kloudless.com:443/v0/accounts/"+ account +"/search/?q="+keyword,
        headers: { 'Authorization': 'ApiKey OKbrCHOC7GeD0UAgr2e_9vG1AePohyOJWpY_LeBpJvHfZTyJ' }
    }).done(function (data) {
        if (verbose) console.log("data", data.objects)
        return cb(data.objects)
    })
}
