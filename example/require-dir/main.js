
var requireDir = require('bale').requireDir;

var foo =  requireDir(__dirname, './lib/foo');

console.log(foo.foo + 7);
