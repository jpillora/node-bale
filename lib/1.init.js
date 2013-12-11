
var fs = require('fs');
var path = require('path');
var helper = require('./helper');
var HashStore = require('./helper').HashStore;
var Zip = require("../manual_modules/adm-zip");

var defaults = {
  hash: false,
  compress: false,
  outputFile: null //defaults to stdout
};

module.exports = function(ctx) {

  if(!ctx.entryFile || !fs.existsSync(ctx.entryFile))
    throw 'missing entry point';

  var name, dir;
  if(fs.statSync(ctx.entryFile).isDirectory()) {
    name = './';
    dir = ctx.entryFile;
  } else {
    name = path.basename(ctx.entryFile);
    dir = path.dirname(ctx.entryFile);
  }

  ctx.pkg = helper.resolvePkg(dir, name);

  //grab defaults defaults
  for(var k in defaults)
    if(ctx.opts[k] === undefined)
      ctx.opts[k] = defaults[k];

  var debugHash = ctx.opts.hash ? null : function (id) {
    return (/^\//).test(id) ? path.relative(dir, id).replace(/\W/g,'-').replace(/^node_modules-/,'') : id;
  };

  //file path hash => file contents
  ctx.modules = new HashStore(debugHash);

  //create in memory zip
  ctx.bundle = new Zip();
  
  //pass ctx on
  return ctx;
};

