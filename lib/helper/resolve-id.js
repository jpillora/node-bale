var fs = require('fs');
var path = require('path');
var resolve = require('resolve');

//converts 'module' into '/root/node_modules/module/index.js'
module.exports = function resolveId(dir, name) {

  var id = path.join(dir, name);

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
    if(stat.isDirectory() && /^\w/.test(name)) {
      name = './'+name;
    }
  }

  var pkg = {};
  //hiding in node_modules somewhere...
  id = resolve.sync(name, {
    basedir: dir,
    packageFilter: function(json, dir) {
      if(!json.name) throw new Error("external package '"+name+"' has no package name");
      if(!json.version) throw new Error("external package '"+name+"' has no package version");
      pkg.id = "#"+json.name+"@"+json.version;
      pkg.dir = dir;
      pkg.json = json;
      return json;
    }
  });

  return pkg.json ? pkg : id;
};