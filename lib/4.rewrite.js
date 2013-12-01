
var fs = require('fs');
var path = require('path');
var util = require('util');
var helper = require('./helper');
var falafel = require('falafel');
var resolve = require('resolve');
var mainTemplatePath = path.join(__dirname, '..', 'templates', 'main.js');
var mainTemplate = fs.readFileSync(mainTemplatePath).toString();
var moduleParams = ['require', 'module', 'exports', '__dirname', '__filename'];

module.exports = function rewriteModules(ctx) {

  var modulesArray = ctx.modules.filter(function(m) {

    //dont rewrite externals
    return !m.external;
    
  }).map(function(m) {
    //rewrite source
    m.source = falafel(m.source, rewriteFile.bind(null, ctx, m));
    //construct module object
    return getModuleObject(ctx, m);
  });

  var output = mainTemplate.
    replace('/*EN☃TRY*/', ctx.modules.get(ctx.entryFile).hash).
    replace('/*M☃DULES*/', helper.indent(modulesArray.join(',\n'), 1));

  if(ctx.opts.compress)
    output = helper.uglify(output, {
      compress: {
        unsafe: true,
        unused: true,
        cascade: true
      }
    });

  ctx.bundle.addFile("index.js", new Buffer(output));

  return ctx;
};

//called for each node in file 'm.id'
function rewriteFile(ctx, m, node) {

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
    modifyRequireDir(ctx, m, node);

  if(node.callee.name === 'require')
    modifyRequire(ctx, m, node.arguments);
}

function modifyRequireDir(ctx, m, node) {
  node.update("{foo:42}");
}

function modifyRequire(ctx, m, args) {
  
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
  var id = helper.resolveId(m.dir, target);
  var t = ctx.modules.get(id);

  if(!t)
    throw "missing module: " + id;

  //modify source to require the hash
  arg.update('"'+t.hash+'"');
}

function getModuleObject(ctx, m) {

  //get args and params
  var params = [];
  var props = [];

  var match = false;
  for(var i = moduleParams.length-1; i >= 0; i--) {
    var p = moduleParams[i];
    if(!match && !m.params[p]) continue;
    match = true;
    params.push(p);
  }

  params = params.reverse().join(', ');
  
  var module = util.format('function(%s){\n%s\n}', params, helper.indent(m.source.toString()));

  if(m.params.__dirname || m.params.__filename)
    props.push(util.format('d: "%s"', rela(m.id)));

  if(m.params.__filename)
    props.push(util.format('f: "%s"', m.basename));

  if(props.length > 0) {
    props.push("m: " + module);
    module = util.format('{\n%s\n}', helper.indent(props.join(',\n')));
  }

  var propname = ctx.opts.hash ? m.hash : util.format('"%s"', m.hash);
  return util.format('%s: %s', propname, module);
}
