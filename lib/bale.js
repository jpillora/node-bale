
var util = require('util');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var compress = require('./compress');
var falafel = require('falafel');
var mkdirp = require('mkdirp');
var mdeps = require('module-deps');
var resolve = require('resolve');
var async = require('async');
var ncp = require('ncp').ncp;
var moduleParams = ['require', 'module', 'exports', '__dirname', '__filename'];

var TMP_DIR = path.join(__dirname,'..','tmp');
mkdirp.sync(TMP_DIR);

var defaults = {
  hash: false,
  compress: false
};

function bale(entryFile, options, callback) {

  var opts = Object.create(defaults);

  if(arguments.length === 2) {
    callback = options;
  } else if(arguments.length === 3) {

    //extend defaults
    for(var k in defaults)
      if(options[k] !== undefined)
        opts[k] = options[k];

  } else {
    return callback('entry file [, options] and callback arguments required');
  }

  if(!entryFile || !fs.existsSync(entryFile))
    return callback('missing entry file');

  var mainTemplate = getTemplate('main.js');

  entryFile = path.resolve(entryFile);
  var entryDir = path.dirname(entryFile);
  var entryHash = null;

  //file path hash => file contents
  var modules = {};

  var externals = {};

  //===========================
  // KICK OFF

  mdeps(entryFile, { filter: filterModules }).
    on('data', categorizeModule).
    on('end', writePackage);

  //===========================
  // BALE SEQUENCE

  function filterModules(name) {
    //skip core
    if(resolve.isCore(name)) return false;

    //include file paths
    if(/^\.?\//.test(name)) return true;

    var id = resolveId(entryDir, name);
    return !externals[id];
  }

  function categorizeModule(m) {
    m.basename = path.basename(m.id);
    m.dir = path.dirname(m.id);
    m.hash = hashId(m.id);
    m.params = {};
    m.args = [];

    if(entryFile === m.id)
      entryHash = m.hash;

    modules[m.id] = m;
  }

  function writePackage() {
    copyExternals(function() {
      var output = rewriteModules();
      fs.writeFileSync(path.join(TMP_DIR, 'app.js'), output);
      callback(null, 'done');
    });
  }

  function copyExternals(next) {
    async.map(Object.keys(externals), function(id, cb) {

      var src = externals[id];
      var dest = path.join(TMP_DIR, "node_modules", hashId(src));

      mkdirp.sync(dest);

      ncp(src, dest, function (err) {
        if (err) return cb(err);
        cb();
      });

    }, function(err){
      if(err) return console.error('error copying externals',err);
      next();
    });
  }

  function rewriteModules() {

    var modulesArray = [];

    for(var hash in modules) {
      var m = modules[hash];
      var source;

      //parse and analyze file
      try {
        source = m.source = falafel(m.source, rewriteFile.bind(null, m));
      } catch(e) {
        return callback("in file '"+rela(m.id)+"': " + (e.stack || e));
      }

      //construct module object
      modulesArray.push(getModuleObject(m, source.toString()));
    }

    var output = mainTemplate.
      replace('/*EN☃TRY*/', entryHash).
      replace('/*M☃DULES*/', indent(modulesArray.join(',\n'), 1));

    if(opts.compress)
      output = compress(output, {
        compress: {
          unsafe: true,
          unused: true,
          cascade: true
        }
      });

    return output;
  }

  //called for each node in file 'm.id'
  function rewriteFile(m, node) {

    //look through *root* (no parent or IS parent) identifiers
    if(node.type === 'Identifier' &&
       moduleParams.indexOf(node.name) >= 0 &&
       (!node.parent ||
        node.parent.type !== 'MemberExpression' ||
        node.parent.object === node))
      m.params[node.name] = true;


    //look for requireDir calls
    if(node.type !== 'CallExpression' ||
       !node.callee ||
       node.callee.type !== 'Identifier')
      return;

    //modify requireDir and require
    if(node.callee.name === 'requireDir')
      modifyRequireDir(m, node);

    if(node.callee.name === 'require')
      modifyRequire(m, node.arguments);
  }

  function modifyRequireDir(m, node) {
    node.update("{foo:42}");
  }

  function modifyRequire(m, args) {
    
    //ensure a single literal string
    if(args.length !== 1)
      throw "require must have one argument";

    var arg = args[0];

    if(arg.type !== 'Literal')
      throw "dynamic require not allowed: require("+arg.source()+")";

    var target = arg.value;
    
    //dont touch build-ins
    if(resolve.isCore(target))
      return;

    //who requiring numbers???
    if(typeof target !== 'string')
      return;

    //make 
    var id = resolveId(m.dir, target);
    var h;

    //not baleable
    if(externals[id]) {
      h = hashId(externals[id]);
    } else if(modules[id]) {
      h = modules[id].hash;
    } else {
      throw "missing module: " + id;
    }

    //modify source to require the hash
    arg.update('"'+h+'"');
  }

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

    //package.json missing bale flag
    if(pkgDir && !baleable)
      externals[id] = pkgDir;

    return id;
  }

  function getModuleObject(m, source) {

    //get args and params
    var params = [];
    var props = [];

    var match = false;
    for(var i = moduleParams.length; i >= 0; i--) {
      var p = moduleParams[i];
      if(!match && !m.params[p]) continue;
      match = true;
      params.push(p);
    }

    params = params.reverse().join(', ');
    
    var module = util.format('function(%s){\n%s\n}', params, indent(source));

    if(m.params.__dirname || m.params.__filename)
      props.push(util.format('d: "%s"', rela(m.id)));

    if(m.params.__filename)
      props.push(util.format('f: "%s"', m.basename));

    if(props.length > 0) {
      props.push("m: " + module);
      module = util.format('{\n%s\n}', indent(props.join(',\n')));
    }

    var propname = opts.hash ? m.hash : util.format('"%s"', m.hash);
    return util.format('%s: %s', propname, module);
  }

  function getTemplate(file) {
    return fs.readFileSync(path.join(__dirname, '..', 'templates', file)).toString();
  }

  function indent(str, times) {
    if(!times) times = 1;
    while(--times >= 0)
      str = str.replace(/^/mg, '  ');
    return str;
  }

  function hashId(path) {
    if(!opts.hash)
      return rela(path).replace(/\W/g,'-');
    var h = crypto.createHash('sha1');
    h.update(path);
    
    //create js identifier
    return h.digest('base64').
      replace(/\W/g,''). //remove /+=
      replace(/^\d+/,''); //remove leading digits

    // var chars = 1;
    // while(true) {
    //   var next = id.substr(0, chars++);
    //   //clash, rename both
    //   if(modules[next]) {

    //     continue;
    //   }
    //   return next;
    // }
  }

  function rela(target) {
    return path.relative(entryDir, target);
  }
}




bale.requireDir = function() {
  var dir = path.join.apply(path,arguments);
  var modules = {};
  
  fs.readdirSync(dir).forEach(function(file) {
    var p = path.join(dir, file);
    if(fs.statSync(p).isFile()) {
      if(!/\.js$/.test(p)) return;
      var name = path.basename(p, '.js');
      modules[name] = require(p);
    }
  });
  return modules;
};

module.exports = bale;

