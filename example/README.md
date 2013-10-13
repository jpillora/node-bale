


```
bale main.js
```

``` js
var required = {};
var require = function(id) {
  if(required[id])
    return required[id];
  var exports = {},
      module = required[id] = { exports: exports };
  modules[id](require, module, exports);
  return exports;
};

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
```
