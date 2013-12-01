

var path = require('path');
var helper = require('../helper');
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

        var info = {};
        var id = helper.resolveId(ctx.entryDir, name, info);

        //include those packages which have explicitly allowed
        if(info.pkg && info.pkg.bale) {
          return true;
        }


        var m = {};
        m.external = true;
        m.dir = info.dir;
        m.pkg = info.pkg;

        console.log('m',m)

        ctx.modules.add(id, m);

        return false;
      }
    }).
    on('data',
      function categorizeModule(m) {
        // console.log('categorize', m.id);
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
