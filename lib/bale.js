
var util = require('util');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var compress = require('./compress');
var tar = require('./tar');
var falafel = require('falafel');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var mdeps = require('module-deps');
var resolve = require('resolve');
var async = require('async');
var ncp = require('ncp').ncp;
var moduleParams = ['require', 'module', 'exports', '__dirname', '__filename'];


var packFns = [
  require('./pack/1.init'),
  require('./pack/2.analyze'),
  require('./pack/3.copy'),
  require('./pack/4.rewrite'),
  require('./pack/5.compress')
];

var pack = module.exports = function(entryFile, outputFile, options, callback) {

  var ctx = {
    entryFile: path.resolve(entryFile),
    outputFile: outputFile,
    options: options
  };

  //bind this context to each step
  packFns = packFns.map(function(fn) {
    return fn.bind(ctx);
  });

  //run!
  async.series(packFns, callback);

};



