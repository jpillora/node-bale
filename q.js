var fs = require('fs');
var Q = require('q');

function getFiles() {
  return Q.ninvoke(fs, "readdir", __dirname).then(function (files) {
    return Q.all(files.map(processFile));
  });
}

function processFile(f) {
  var d = Q.defer();
  setTimeout(function() {
    console.log('found',f);
  }, 10+Math.random()*100);
  return d.promise;
}

getFiles().then(function() {
  console.log('done');
}, function(err) {
  console.log('err!', err);
});