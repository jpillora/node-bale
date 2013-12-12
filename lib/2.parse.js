

var fs = require('fs');
var path = require('path');
var Q = require('q');

var File = require('./file');
var Package = require('./package');

module.exports = function(ctx) {

  //===========================
  // create file/package map in memory

  ctx.files = {};
  ctx.pkgs = {};

  //add main packge
  function processDir(dir, pkg) {
    return Q.ninvoke(fs, 'readdir', dir).then(function(entries) {

      //create new package
      if(entries.indexOf('package.json') >= 0) {
        pkg = new Package(path.join(dir,'package.json'));
        ctx.pkgs[pkg] = pkg;
      }
      
      return Q.all(entries.map(function(f) {
        return process(path.join(dir, f), pkg);
      }));
    });
  }

  function processFile(filepath, pkg) {

    if(/^\./.test(path.basename(filepath)))
      return true;

    return Q.ninvoke(fs, 'readFile', filepath).then(function(contents) {
      var file = new File(filepath, contents, pkg);
      ctx.files[file] = file;
      pkg.add(file);
      return true;
    });
  }

  function process(target, pkg) {
    return Q.ninvoke(fs, 'stat', target).then(function(stat) {
      if(stat.isDirectory())
        return processDir(target, pkg);
      else if(stat.isFile())
        return processFile(target, pkg);
      else
        return true;
    });
  }

  return process(ctx.entry).then(function() {
    return ctx;
  });

};
