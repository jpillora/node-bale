
var path = require('path');
var Q = require('q');

module.exports = function(entry, opts, callback) {

  //check args
  if(arguments.length === 2) {
    callback = opts;
    opts = {};
  } else if(arguments.length !== 3) {
    throw new Error('invalid arguments: pack(entryFile [, options], callback)');
  }

  Q({
    entry: path.resolve(entry),
    opts: opts
  }).then(require('./1.init'))
    .then(require('./2.parse'))
    .then(require('./3.rewrite'))
    .then(require('./4.copy'))
    .done(function() {
      callback(null);
    }, function(err) {
      callback(err);
    });
    
};
