//anonymous bootstrapper
(function(modules) {

  var path = require('path');

  //module cache
  var cache = {};
  //faux require
  function req(id) {
    if(cache[id])
      return cache[id];
    
    var obj = modules[id];
    if(!obj) return require(id);

    var exports = {},
        module = cache[id] = { exports: exports };

    if(typeof obj === 'function')
      obj.m = obj;

    var args = [req, module, exports];

    if(obj.d)
      args.push(path.resolve(path.join(__dirname, obj.d)));

    if(obj.f)
      args.push(path.join(args[3], obj.f));

    obj.m.apply(global, args);
    return module.exports;
  }
  //expose
  module.exports = req("/*EN☃TRY*/");
}({
/*M☃DULES*/
}));