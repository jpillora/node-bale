
var path = require('path');
var glob = require('glob');
var Q = require('q');

module.exports = function(ctx) {

  var d = Q.defer();

  //add external modules to bundle
  ctx.modules.filter(function(m) {
    return !m.bale;
  }).forEach(function addExternal(m) {
    var localPath = m.dir;
    var zipPath = 'node_modules'+path.sep+m.hash;

    ctx.bundle.addLocalFolder(localPath, zipPath);
  });

  var staticFiles = {};

  //convert all static fields into file resolving promises
  var promises = ctx.modules.filter(function(m) {
    return m.bale && m.bale.static;
  }).map(function(m) {

    var d = Q.defer();

    glob(m.bale.static, { cwd: ctx.pkg.dir }, function(err, files) {

      if(err) return d.reject(err);
      files.forEach(function(f) {

        var localPath = path.join(ctx.pkg.dir, f);
        var zipPath = f;

        if(staticFiles[zipPath]) {
          console.error('static file already exists');
          return d.reject('!');
        }

        staticFiles[zipPath] = localPath;
        ctx.bundle.addLocalFile(localPath, path.dirname(zipPath));
      });

      d.resolve();
    });

    return d.promise;
  });

  Q.all(promises).done(function() {
    d.resolve(ctx);
  });

  return d.promise;
};