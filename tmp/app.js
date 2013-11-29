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
  module.exports = req("main-js");
}({
  "main-js": function(require){
    var a = require("a-index-js");
    var b = require("node_modules-b-lib-main-js");
    var c = require("node_modules-c");
    var d = require("node_modules-d-index-js");
    
    console.log(a+b-c,d);
    
    
  },
  "node_modules-d-index-js": function(require, module){
    module.exports = "d";
  },
  "node_modules-b-lib-main-js": function(require, module){
    module.exports = 9;
  },
  "a-index-js": function(require, module){
    module.exports = 32;
  }
}));