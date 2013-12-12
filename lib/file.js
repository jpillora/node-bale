var path = require('path');

var File = module.exports = function File(id, contents, pkg) {
  this.id = id;
  this.dir = path.dirname(id);
  this.ext = path.extname(id);
  this.base = path.basename(id);
  this.contents = contents.toString();
  if(!pkg) throw "file missing pkg";
  this.pkg = pkg;
  this.parents = {};
  this.children = {};
  this.dynamic = false;
};

File.prototype.requires = function(file) {
  this.children[file.id] = file;
  file.parents[this.id] = this;
};

File.prototype.toString = function() {
  return this.id;
};