module.exports = function(callback) {

  async.map(Object.keys(externals), function(id, cb) {

    var src = externals[id].dir;
    var dest = path.join(TMP_DIR, "node_modules", externals[id].hash);

    mkdirp.sync(dest);

    ncp(src, dest, function (err) {
      if (err) return cb(err);
      cb();
    });

  }, function(err){
    if(err) return console.error('error copying externals',err);
    next();
  });

};