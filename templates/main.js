(function() {
  var require = (function() {
    var cache = {};
    return function(id) {
      if(cache[id])
        return cache[id];
      var exports = {},
          module = cache[id] = { exports: exports };
      modules[id](require, module, exports);
      return exports;
    };
  }());

  var modules = [
//MODULES//
  ];
  return require(0);
}());