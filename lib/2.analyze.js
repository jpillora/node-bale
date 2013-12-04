

var path = require('path');
var helper = require('./helper');
var Q = require('q');
var mdeps = require('module-deps');
var resolve = require('resolve');

module.exports = function(ctx) {

  var d = Q.defer();

  //===========================
  // PARSE DEPENDENCIES

  var ids = {};
  var pkgs = {};

  //add main packge
  pkgs[ctx.pkg.entry] = initPackage(ctx.pkg);

  function initPackage(pkg) {
    pkg.params = {};
    pkg.args = [];
    if(!pkg.json) pkg.dir = path.dirname(pkg.id);
    return pkg;
  }

  mdeps(ctx.entryFile, {
    filter: function filterModules(name) {
      //skip core
      if(resolve.isCore(name)) return false;
      //get 
      var pkg = helper.resolvePkg(ctx.pkg.dir, name);

      //already included
      if(pkgs[pkg.id]) return false;
      ids[pkg.id] = true;

      pkgs[pkg.entry] = initPackage(pkg);

      //can be included?
      return pkg.bale;
    }
  }).
  on('data',
    function grabSource(m) {
      var entry = m.id;
      var pkg = pkgs[entry];
      pkg.source = m.source;
    }
  ).
  on('end',
    function compressHashes() {

      for(var file in pkgs) {
        var pkg = pkgs[file];
        ctx.modules.add(pkg.id, pkg);
      }

      if(ctx.opts.hash)
        ctx.modules.compress();

      //move onto copy
      d.resolve(ctx);
    }
  ).
  on('error', function(err) {
    d.reject(err);
  });

  return d.promise;

};
