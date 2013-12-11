var Q = require("q"),
    fs = require("fs"),
    path = require("path"),
    fstream = require("fstream"),
    tar = require("tar"),
    es = require("event-stream"),
    zlib = require("zlib");

module.exports = function(targetDir, callback) {

  function processDir(dir) {
    var d = Q.defer();

    fs.readdir(dir, function(err, entries) {
      if(err) return d.reject(err);

      var promises = entries.map(function(f) {
        return process(path.join(dir, f));
      });

      Q.all(promises).then(d.resolve, d.reject);
    });

    return d.promise;
  }

  function processFile(file) {

    console.log(file);

    return Q(true);
  }

  function process(target) {
    var d = Q.defer();

    fs.stat(target, function(err, stat) {
      if(err) return d.reject(err);

      if(stat.isDirectory())
        processDir(target).then(d.resolve, d.reject);
      else if(stat.isFile())
        processFile(target).then(d.resolve, d.reject);
    });

    return d.promise;
  }

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

