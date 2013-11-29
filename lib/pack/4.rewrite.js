
var fs = require('fs');
var mainTemplate = fs.readFileSync(
    path.join(__dirname, '..', 'templates', 'main.js')
  ).toString();


module.exports = function(callback) {



};


    // var output = rewriteModules();
    // fs.writeFileSync(path.join(TMP_DIR, 'index.js'), output);
    // zipPackage();

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
      replace('/*EN☃TRY*/', modules[entryFile].hash).
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
      h = externals[id].hash;
    } else if(modules[id]) {
      h = modules[id].hash;
    } else {
      throw "missing module: " + id;
    }

    //modify source to require the hash
    arg.update('"'+h+'"');
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
