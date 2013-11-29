
  //converts 'module' into '/root/node_modules/module/index.js'
  function resolveId() {

    var id, dir, name;

    if(arguments.length === 1) {
      id = arguments[0];
      dir = path.dirname(id);
      name = path.basename(id);

    } else if (arguments.length === 2) {
      dir = arguments[0];
      name = arguments[1];
      id = path.join(dir, name);
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
    var baleable = null;
    var pkgDir = null;

    id = resolve.sync(name, {
      basedir: dir,
      packageFilter: function(pkg, dir) {
        baleable = !!pkg.bale;
        pkgDir = dir;
        return pkg;
      }
    });

    //init externals list (package.json missing bale flag)
    if(!externals[id] && pkgDir && !baleable) {
      var e = {
        dir: pkgDir,
        hash: hashExtId(pkgDir, id)
      };
      externals[id] = e;
      hashes.push(e.hash);
    }

    return id;
  }