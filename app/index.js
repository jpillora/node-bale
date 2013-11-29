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
  module.exports = req("J");
}({
  J: function(require){
    var foo = require("L");
    console.log(foo.foo + 7);
  },
  L: function(require, module, exports){
    var bar = require("f");
    exports.foo = bar.bar + 4;
  },
  f: function(require, module, exports){
    exports.bar = 2;
  }
}));