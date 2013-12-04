

exports.HashStore = require('./hash-store');

exports.uglify = require('./uglify');

exports.resolvePkg = require('./resolve-id');

// var tarUntar = require('./tar-untar');
// exports.tar = tarUntar.tar;
// exports.untar = tarUntar.untar;

exports.indent = function(str, times) {
  if(!times) times = 1;
  while(--times >= 0)
    str = str.replace(/^/mg, '  ');
  return str;
};


// var fs = require('fs');
// exports.walk = function(dir, done) {
//   var results = [];
//   fs.readdir(dir, function(err, list) {
//     if (err) return done(err);
//     var pending = list.length;
//     if (!pending) return done(null, results);
//     list.forEach(function(file) {
//       file = dir + '/' + file;
//       fs.stat(file, function(err, stat) {
//         if (stat && stat.isDirectory()) {
//           walk(file, function(err, res) {
//             results = results.concat(res);
//             if (!--pending) done(null, results);
//           });
//         } else {
//           results.push(file);
//           if (!--pending) done(null, results);
//         }
//       });
//     });
//   });
// };

