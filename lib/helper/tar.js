var Q = require("q"),
    fs = require("fs"),
    path = require("path"),
    fstream = require("fstream"),
    tar = require("tar"),
    es = require("event-stream"),
    zlib = require("zlib");

module.exports = function(targetDir, callback) {



  process(targetDir).then(function() {
    callback();
  }, function(err) {
    callback(err);
  });



  // var read = fstream.Reader({ path: targetDir, type: "Directory" });

  // read.on('error', function(err) {
  //   callback('read error: ' + err);
  // });


  // var convert = es.through(function write(data) {
  //   console.log(data.toString());
  //   this.emit('data', data);
  // },
  // function end () {
  //   this.emit('end');
  // });

  // var write = fstream.Writer(destFile);

  // write.on('error', function(err) {
  //   callback('write error: ' + err);
  // });

  // write.on('close', function() {
  //   callback();
  // });

  // read
  //   .pipe(convert)
  //   .pipe(tar.Pack())
  //   .pipe(zlib.createGzip())
  //   .pipe(process.stdout);
};

module.exports.un = function() {
  
};

