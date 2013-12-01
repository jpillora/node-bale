
var path = require('path');

module.exports = function(ctx) {

  ctx.modules.each(function(m) {

    if(!m.external) return;

    //add external modules to bundle
    var localPath = m.dir;
    var zipPath = 'node_modules'+path.sep+m.hash;

    ctx.bundle.addLocalFolder(localPath, zipPath);
  });

  return ctx;
};