var fs = require('fs');
var path = require('path');
var resolve = require('resolve');

//converts 'module' into '/root/node_modules/module/index.js'
module.exports = function resolveId() {

  var id, dir, name, info;

  if(arguments.length === 1) {
    id = arguments[0];
    dir = path.dirname(id);
    name = path.basename(id);

  } else if (arguments.length === 3) {
    dir = arguments[0];
    name = arguments[1];
    id = path.join(dir, name);
    info = arguments[2];


  } else {
    throw "invalid args";
  }

  //missing da ext.
  if(fs.existsSync(id+'.js'))
    id = id+'.js';

  //manual path
  if(fs.existsSync(id)) {
    var stat = fs.statSync(id);
    //manual file reference 
    if(stat.isFile()) {
      return id;
    }
    //manual directory reference - prepare for resolve
    if(stat.isDirectory()) {
      name = './'+name;
    }
  }

  //hiding in node_modules somewhere...
  id = resolve.sync(name, {
    basedir: dir,
    packageFilter: function(pkg, dir) {
      if(info) {
        info.dir = dir;
        info.pkg = pkg;
      }
      return pkg;
    }
  });

  return id;
}.bind(null);