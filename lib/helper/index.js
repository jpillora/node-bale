

exports.HashStore = require('./hash-store');

exports.uglify = require('./uglify');

exports.resolveId = require('./resolve-id');

// var tarUntar = require('./tar-untar');
// exports.tar = tarUntar.tar;
// exports.untar = tarUntar.untar;

exports.indent = function(str, times) {
  if(!times) times = 1;
  while(--times >= 0)
    str = str.replace(/^/mg, '  ');
  return str;
};