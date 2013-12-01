
var path = require('path');
var Q = require('q');

module.exports = function(entryFile, opts, callback) {

  //check args
  if(arguments.length === 2) {
    callback = opts;
    opts = {};
  } else if(arguments.length !== 3) {
    throw new Error('invalid arguments: pack(entryFile [, options], callback)');
  }

  Q({
    entryFile: path.resolve(entryFile),
    opts: opts
  }).then(require('./1.init'))
    .then(require('./2.analyze'))
    .then(require('./3.copy'))
    .then(require('./4.rewrite'))
    .then(require('./5.compress'))
    .done(function() {
      callback(null);
    }, function(err) {
      callback(err);
    });
    
};
