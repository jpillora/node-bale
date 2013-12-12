
var fs = require('fs');
var path = require('path');
var HashStore = require('./helper').HashStore;

var defaults = {
  hash: false,
  compress: false,
  includeDotFiles: false,
  outputFile: null //defaults to stdout
};

module.exports = function(ctx) {

  if(!ctx.entry || !fs.existsSync(ctx.entry))
    throw 'missing entry point';

  if(!fs.statSync(ctx.entry).isDirectory()) {
    throw 'must be a directory';
  }

  var pkg = fs.readFileSync(path.join(ctx.entry, 'package.json'));
  if(!pkg) {
    throw 'missing package.json';
  }

  //grab defaults defaults
  for(var k in defaults)
    if(ctx.opts[k] === undefined)
      ctx.opts[k] = defaults[k];

  var debugHash = ctx.opts.hash ? null : function (id) {
    return (/^\//).test(id) ? path.relative(dir, id).replace(/\W/g,'-').replace(/^node_modules-/,'') : id;
  };

  //file path hash => file contents
  ctx.modules = new HashStore(debugHash);

  //pass ctx on
  return ctx;
};

