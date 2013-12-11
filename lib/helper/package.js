
module.exports = function Package(id) {
  this.parents = {};
  this.children = {};
  this.dynamic = false;
  this.id = id;
};

File.prototype.requires = function(file) {
  this.children[file.id] = file;
  file.parents[this.id] = this;
};
