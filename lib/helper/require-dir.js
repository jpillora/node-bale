
bale.requireDir = function() {
  var dir = path.join.apply(path,arguments);
  var modules = {};
  
  fs.readdirSync(dir).forEach(function(file) {
    var p = path.join(dir, file);
    if(fs.statSync(p).isFile()) {
      if(!/\.js$/.test(p)) return;
      var name = path.basename(p, '.js');
      modules[name] = require(p);
    }
  });
  return modules;
};