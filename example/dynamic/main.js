var coin = Math.random() >= 0.5 ? 'heads' : 'tails';
var module = require('./lib/' + coin);
console.log("our module is: " + module);