
var fs = require('fs');
var path = require('path');
var HashStore = require('./helper').HashStore;
var Zip = require("../manual_modules/adm-zip");

var defaults = {
  hash: false,
  compress: false,
  outputFile: null //defaults to stdout
};

module.exports = function(ctx) {

  if(!ctx.entryFile || !fs.existsSync(ctx.entryFile))
    throw 'missing entry file';
  //calc entry dir
  ctx.entryDir = path.dirname(ctx.entryFile);

  //grab defaults defaults
  for(var k in defaults)
    if(ctx.opts[k] === undefined)
      ctx.opts[k] = defaults[k];

  //debug hash paths
  var fakeHasher = ctx.opts.hash ? null : function(id) {
    return path.relative(ctx.entryDir, id)
            .replace(/\W/g,'-')
            .replace(/^node_modules-/,'');
  };

  //file path hash => file contents
  ctx.modules = new HashStore(fakeHasher);

  //create in memory zip
  ctx.bundle = new Zip();
  
  //pass ctx on
  return ctx;
};
