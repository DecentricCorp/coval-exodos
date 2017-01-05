var ProgressBar = require('progress')
var fs = require('fs')
var utils = {}

Array.prototype.unique = function() {
    var sorted = this;
    sorted.sort();
    return sorted.filter(function(value, index, arr){
        if(index < 1) 
            return true;
        else
            return value != arr[index-1];
    });
}

utils.genProgressBar = function(len, title){
	var bar = new ProgressBar('  '+title+' [:bar] :percent', {
	    complete: '=',
	    incomplete: ' ',
	    width: 20,
	    total: len
	})
	return bar
}
utils.sort_by = function(field, reverse, primer) {
    var key = primer ?function(x) {
            return primer(x[field])
        } :
        function(x) {
            return x[field]
        }
    reverse = !reverse ? 1 : -1
    return function(a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    }
}
utils.write = function(contents, fileName, cb){
    fs.writeFile(fileName, JSON.stringify(contents), function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!")
        if (cb) return cb(!error)
    })
}

utils.read = function(fileName, cb) {
    fs.readFile(fileName,'utf8', function read(err, data) {
        if (err) {
            throw err;
        }
        if (cb) return cb(JSON.parse(data))
    })
}

module.exports = utils