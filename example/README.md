Run this:
```
bale main.js
```
Outputs this:
``` js
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
    (function(require, module, exports) {
      var foo = require(1);
      console.log(foo.foo + 7);
    }),
    (function(require, module, exports) {
      var bar = require(2);
      exports.foo = bar.bar + 4;
    }),
    (function(require, module, exports) {
      exports.bar = 42;
    })
  ];
  require(0);
}());
```
Minifies to this:
```
!function(){var n=function(){var r={};return function(t){if(r[t])return r[t];
var f={},u=r[t]={exports:f};return o[t](n,u,f),f}}(),o=[function(n){var o=n(1);
console.log(o.foo+7)},function(n,o,r){var t=n(2);r.foo=t.bar+4},function(n,o,r){r.bar=42}];n(0)}();
```