
var fs = require('fs');
var path = require('path');

var secret = fs.readFileSync(path.join(__dirname,'..','my-files','secret.txt'));

console.log(secret.toString());