var fstream = require("fstream"),
    tar = require("tar"),
    zlib = require("zlib");

exports.tar = function(targetDir, destFile, callback) {

  var read = fstream.Reader({ path: targetDir, type: "Directory" });

  read.on('error', function(err) {
    callback('read error: ' + err);
  });

  var write = fstream.Writer(destFile);

  write.on('error', function(err) {
    callback('write error: ' + err);
  });

  write.on('close', function() {
    callback();
  });

  read
    .pipe(tar.Pack())
    .pipe(zlib.createGzip())
    .pipe(write);
};

exports.untar = function() {
  
}

