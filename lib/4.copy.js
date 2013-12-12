
var archiver = require('archiver');
var path = require('path');
var fs = require('fs');
var Q = require('q');

module.exports = function(ctx) {

  //create zip
  var archive = archiver('zip');
  
  //write out to a file if specified, otherwise stdout
  var out;
  if(ctx.opts.outputFile) {
    out = fs.createWriteStream(ctx.opts.outputFile);
  } else {
    out = process.stdout;
  }

  archive.pipe(out);

  for(var f in ctx.files) {
    var file = ctx.files[f];
    var dest = path.relative(ctx.entry, file.id);

    archive.append(file.contents, { name: dest });
  }

  return Q.ninvoke(archive, 'finalize');
};