

var path = require('path');
var helper = require('./helper');
var Q = require('q');
var mdeps = require('module-deps');
var resolve = require('resolve');

module.exports = function(ctx) {

  var d = Q.defer();

  //===========================
  // PARSE DEPENDENCIES

  mdeps(ctx.entryFile, {
    filter: function filterModules(name) {
      //skip core
      if(resolve.isCore(name)) return false;

      //include if specifies file paths
      if(/^\.?\//.test(name)) return true;

      var pkg = helper.resolveId(ctx.entryDir, name);

      //include those packages which are file references
      //or if they have been explicitly allowed
      if(typeof pkg === 'string' || pkg.json.bale)
        return true;

      //NOT included, prepare for external packaging
      ctx.modules.add(pkg.id, pkg);

      return false;
    }
  }).
  // on('error', function(err) {
  //   console.error(err);
  // }).
  on('data',
    function categorizeModule(m) {
      // console.log('categorize', m.id);
      m.internal = true;
      m.basename = path.basename(m.id);
      m.dir = path.dirname(m.id);
      m.params = {};
      m.args = [];

      ctx.modules.add(m.id, m);
    }
  ).
  on('end',
    function compressHashes() {

      if(ctx.opts.hash)
        ctx.modules.compressHashes();

      //move onto copy
      d.resolve(ctx);
    }
  );

  return d.promise;

};
