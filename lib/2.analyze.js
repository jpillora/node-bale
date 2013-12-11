

var fs = require('fs');
var path = require('path');
var helper = require('./helper');
var Q = require('q');
var mdeps = require('module-deps');
var resolve = require('resolve');

module.exports = function(ctx) {

  var d = Q.defer();

  //===========================
  // PARSE DEPENDENCIES

  //temporary stores
  // var ids = {};
  // var pkgs = {};

  function initPackage(pkg) {
    pkg.params = {};
    pkg.args = [];
    if(!pkg.json) pkg.dir = path.dirname(pkg.id);
    return pkg;
  }

  //add main packge
  function processDir(dir) {
    var d = Q.defer();

    fs.readdir(dir, function(err, entries) {
      if(err) return d.reject(err);

      var i = entries.indexOf('package.json');

      if(i >= 0)
        


      var promises = 

      promises.map(function(f) {
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


  process(ctx.pkg.dir);


  // pkgs[ctx.pkg.entry] = initPackage(ctx.pkg);

  // mdeps(ctx.pkg.entry, {
  //   filter: function filterModules(name) {
  //     //skip core
  //     if(resolve.isCore(name)) return false;
  //     //get 
  //     var pkg = helper.resolvePkg(ctx.pkg.dir, name);

  //     //already included
  //     if(pkgs[pkg.id]) return false;
  //     ids[pkg.id] = true;

  //     pkgs[pkg.entry] = initPackage(pkg);

  //     //can be included?
  //     return !!pkg.bale;
  //   }
  // }).
  // on('data',
  //   function grabSource(m) {
  //     var entry = m.id;
  //     var pkg = pkgs[entry];
  //     pkg.source = m.source;
  //   }
  // ).
  // on('end',
  //   function compressHashes() {

  //     //insert into modules store
  //     for(var file in pkgs) {
  //       var pkg = pkgs[file];
  //       ctx.modules.add(pkg.id, pkg);
  //     }

  //     if(ctx.opts.hash)
  //       ctx.modules.compress();

  //     //move onto copy
  //     d.resolve(ctx);
  //   }
  // ).
  // on('error', function(err) {
  //   d.reject(err);
  // });

  // return d.promise;

};
